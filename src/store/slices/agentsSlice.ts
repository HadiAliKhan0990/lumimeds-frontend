import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from './agentsApiSlice';

interface AgentsState {
  agents: Agent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const initialState: AgentsState = {
  agents: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 30,
    pages: 0,
  },
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<{ agents: Agent[]; pagination: AgentsState['pagination'] }>) => {
      state.agents = action.payload.agents;
      state.pagination = action.payload.pagination;
    },
    updateAgent: (state, action: PayloadAction<Agent>) => {
      const updatedAgent = action.payload;
      const index = state.agents.findIndex((agent) => agent.id === updatedAgent.id);
      if (index !== -1) {
        state.agents[index] = updatedAgent;
      }
    },
    addAgent: (state, action: PayloadAction<Agent>) => {
      state.agents.unshift(action.payload);
      state.pagination.total += 1;
    },
  },
});

export const { setAgents, updateAgent, addAgent } = agentsSlice.actions;
export default agentsSlice.reducer;
