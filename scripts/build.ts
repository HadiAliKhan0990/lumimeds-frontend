// import { spawnSync } from 'child_process';
// import { existsSync, rmSync } from 'fs';
// import { join } from 'path';

// class BuildRunner {
//   private cachePath = join(process.cwd(), '.next', 'cache');

//   cleanCache(): void {
//     try {
//       if (existsSync(this.cachePath)) {
//         rmSync(this.cachePath, { recursive: true, force: true });
//         console.log('✅ Cache cleaned successfully');
//       } else {
//         console.log('ℹ️  Cache directory does not exist, skipping');
//       }
//     } catch (error) {
//       console.error('❌ Failed to clean cache:', error instanceof Error ? error.message : String(error));
//       process.exit(1);
//     }
//   }

//   runNextBuild(): number {
//     console.log('🚀 Starting Next.js build...');

//     const result = spawnSync('next', ['build'], {
//       stdio: 'inherit',
//       shell: true,
//       env: { ...process.env, NODE_ENV: 'production' },
//     });

//     if (result.status !== 0) {
//       console.error('❌ Next.js build failed');
//       return result.status || 1;
//     }

//     console.log('✅ Build completed successfully');
//     return 0;
//   }

//   async run(): Promise<void> {
//     console.log('🏗️  Starting build process...');

//     this.cleanCache();
//     const exitCode = this.runNextBuild();

//     process.exit(exitCode);
//   }
// }

// // Run the build
// new BuildRunner().run().catch((error) => {
//   console.error('💥 Unexpected build error:', error);
//   process.exit(1);
// });

import { spawnSync } from 'child_process';
import { existsSync, rmSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';

class BuildRunner {
  private cachePath = join(process.cwd(), '.next', 'cache');
  private nextPath = join(process.cwd(), '.next');
  private shouldCleanCache: boolean;
  private nodeMemoryLimit: string;

  constructor() {
    // Check for command-line flag --no-cache or --clean-cache
    // Or environment variable CLEAN_CACHE
    const args = process.argv.slice(2);
    const hasNoCacheFlag = args.includes('--no-cache') || args.includes('--clean-cache');
    const envCleanCache = process.env.CLEAN_CACHE === 'true' || process.env.CLEAN_CACHE === '1';
    
    // Default behavior: clean cache (for backward compatibility)
    // Use --no-cache flag or CLEAN_CACHE=false to skip cleaning
    const skipCache = args.includes('--no-cache') || process.env.CLEAN_CACHE === 'false' || process.env.CLEAN_CACHE === '0';
    
    this.shouldCleanCache = hasNoCacheFlag || envCleanCache || !skipCache;

    // Get memory limit from environment variable, default to 6144 (6GB) for safety
    // This leaves 2GB for OS on an 8GB system
    const envMemoryLimit = process.env.NODE_MEMORY_LIMIT_MB || process.env.NODE_MAX_OLD_SPACE_SIZE;
    this.nodeMemoryLimit = envMemoryLimit || '6144';
  }

  cleanCache(): void {
    if (!this.shouldCleanCache) {
      console.log('ℹ️  Skipping cache cleanup (use --clean-cache or CLEAN_CACHE=true to enable)');
      return;
    }

    try {
      if (existsSync(this.cachePath)) {
        rmSync(this.cachePath, { recursive: true, force: true });
        console.log('✅ Cache cleaned successfully');
      } else {
        console.log('ℹ️  Cache directory does not exist, skipping');
      }
    } catch (error) {
      console.error('❌ Failed to clean cache:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  removeSourceMaps(): void {
    console.log('🗺️  Removing source maps to reduce deployment size...');
    
    try {
      let removedCount = 0;
      let savedSize = 0;

      const processDirectory = (dir: string) => {
        if (!existsSync(dir)) return;

        const entries = readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            processDirectory(fullPath);
          } else if (entry.name.endsWith('.map')) {
            try {
              const stats = statSync(fullPath);
              savedSize += stats.size;
              unlinkSync(fullPath);
              removedCount++;
            } catch (error) {
              console.warn(`⚠️  Could not remove ${fullPath}`);
            }
          }
        }
      };

      processDirectory(this.nextPath);

      const savedSizeMB = (savedSize / (1024 * 1024)).toFixed(2);
      console.log(`✅ Removed ${removedCount} source map files`);
      console.log(`💾 Saved ${savedSizeMB}MB of deployment size`);
    } catch (error) {
      console.error('❌ Failed to remove source maps:', error instanceof Error ? error.message : String(error));
      // Don't exit - source maps removal is optional
    }
  }

  runNextBuild(): number {
    console.log('🚀 Starting Next.js build...');
    console.log(`💾 Node.js memory limit: ${this.nodeMemoryLimit}MB (${(parseInt(this.nodeMemoryLimit) / 1024).toFixed(1)}GB)`);
    
    const nodeOptions = `--max-old-space-size=${this.nodeMemoryLimit}`;
    process.env.NODE_OPTIONS = nodeOptions;

    const result = spawnSync('next', ['build'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NODE_OPTIONS: nodeOptions,
      },
    });

    if (result.status !== 0) {
      console.error('❌ Next.js build failed');
      return result.status || 1;
    }

    console.log('✅ Build completed successfully');
    return 0;
  }

  async run(): Promise<void> {
    console.log('🏗️  Starting build process...');
    if (this.shouldCleanCache) {
      console.log('🧹 Cache cleaning: ENABLED');
    } else {
      console.log('🧹 Cache cleaning: DISABLED (using existing cache)');
    }

    this.cleanCache();
    const exitCode = this.runNextBuild();

    if (exitCode === 0) {
      // Only remove source maps if build succeeded
      // Sentry has already uploaded them during the build
      this.removeSourceMaps();
    }

    process.exit(exitCode);
  }
}

// Run the build
new BuildRunner().run().catch((error) => {
  console.error('💥 Unexpected build error:', error);
  process.exit(1);
});
