'use client';

import React from 'react';

function SkeletonList({ items = 3 }: { items?: number }) {
    return (
        <div className='d-flex flex-column gap-3 border border-c-light rounded-12 p-3 placeholder-wave'>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className='d-flex align-items-center gap-3'>
                    <div className='placeholder rounded' style={{ width: 56, height: 56 }} />
                    <div className='flex-grow-1 d-flex flex-column gap-2'>
                        <div className='placeholder col-7 rounded' style={{ height: 12 }} />
                        <div className='placeholder col-6 rounded' style={{ height: 12 }} />
                        <div className='placeholder col-5 rounded' style={{ height: 12 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}



function GeneralInfoSkeletonCard() {
    return (
        <div className='card border border-c-light rounded-12 h-100'>
            <div className='card-body d-flex flex-column gap-3 placeholder-wave'>
                <div className='d-flex align-items-center justify-content-between'>
                    <div className='placeholder col-3 rounded' style={{ height: 18 }} />
                    <div className='placeholder rounded-pill' style={{ width: 90, height: 24 }} />
                </div>

                <div className='row g-3'>
                    <div className='col-6'>
                        <div className='d-flex flex-column gap-2'>
                            <div className='placeholder col-6 rounded' style={{ height: 12 }} />
                            <div className='placeholder col-5 rounded' style={{ height: 16 }} />
                        </div>
                    </div>
                    <div className='col-6'>
                        <div className='d-flex flex-column gap-2'>
                            <div className='placeholder col-6 rounded' style={{ height: 12 }} />
                            <div className='placeholder col-8 rounded' style={{ height: 16 }} />
                        </div>
                    </div>

                    <div className='col-6'>
                        <div className='d-flex flex-column gap-2'>
                            <div className='placeholder col-6 rounded' style={{ height: 12 }} />
                            <div className='placeholder col-6 rounded' style={{ height: 16 }} />
                        </div>
                    </div>
                    <div className='col-6'>
                        <div className='d-flex flex-column gap-2'>
                            <div className='placeholder col-4 rounded' style={{ height: 12 }} />
                            <div className='d-flex flex-column gap-2'>
                                <div className='placeholder col-10 rounded' style={{ height: 14 }} />
                                <div className='placeholder col-9 rounded' style={{ height: 14 }} />
                                <div className='placeholder col-6 rounded' style={{ height: 14 }} />
                            </div>
                        </div>
                    </div>

                    <div className='col-6'>
                        <div className='d-flex flex-column gap-2'>
                            <div className='placeholder col-3 rounded' style={{ height: 12 }} />
                            <div className='placeholder col-2 rounded' style={{ height: 16 }} />
                        </div>
                    </div>
                    <div className='col-6'>
                        <div className='d-flex flex-column gap-2'>
                            <div className='placeholder col-5 rounded' style={{ height: 12 }} />
                            <div className='placeholder col-6 rounded' style={{ height: 16 }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SelectedOrderSkeletonCard() {
    return (
        <div className='card border border-c-light rounded-12'>
            <div className='card-body d-flex flex-column gap-3 placeholder-wave'>
                <div className='placeholder col-4 rounded' style={{ height: 16 }} />
                <div className='placeholder w-50 rounded' style={{ height: 190 }} />
            </div>
        </div>
    );
}

function OrderNotesSkeletonCard() {
    return (
        <div className='card border border-c-light rounded-12'>
            <div className='card-body d-flex flex-column gap-3 placeholder-wave'>
                <div className='d-flex align-items-center justify-content-between'>
                    <div className='placeholder col-2 rounded' style={{ height: 16 }} />
                    <div className='d-flex align-items-center gap-2'>
                        <div className='placeholder rounded-pill' style={{ width: 90, height: 20 }} />
                        <div className='placeholder rounded-pill' style={{ width: 80, height: 20 }} />
                    </div>
                </div>
                <div className='placeholder rounded' style={{ height: 220 }} />
            </div>
        </div>
    );
}

function RxFormSkeletonCard() {
    return (
        <div className='card border border-c-light rounded-12'>
            <div className='card-body placeholder-wave'>
                <div className='d-flex align-items-center justify-content-between mb-3'>
                    <div className='placeholder col-2 rounded' style={{ height: 16 }} />
                    <div className='d-flex align-items-center gap-2'>
                        <div className='placeholder rounded-pill' style={{ width: 90, height: 28 }} />
                        <div className='placeholder rounded-pill' style={{ width: 90, height: 28 }} />
                    </div>
                </div>

                <div className='row g-3'>
                    <div className='col-md-6'>
                        <div className='placeholder rounded w-100' style={{ height: 40 }} />
                    </div>
                    <div className='col-md-6'>
                        <div className='placeholder rounded w-100' style={{ height: 40 }} />
                    </div>
                    <div className='col-12'>
                        <div className='placeholder rounded w-100' style={{ height: 90 }} />
                    </div>
                    <div className='col-12'>
                        <div className='placeholder rounded w-100' style={{ height: 90 }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SmallCardHeader({ rightPills = 1 }: { rightPills?: number }) {
    return (
        <div className='d-flex align-items-center justify-content-between mb-2 placeholder-wave'>
            <div className='placeholder col-4 rounded' style={{ height: 18 }} />
            <div className='d-flex align-items-center gap-2'>
                {Array.from({ length: rightPills }).map((_, i) => (
                    <div key={i} className='placeholder rounded-pill' style={{ width: 80, height: 20 }} />
                ))}
            </div>
        </div>
    );
}

function NotesSmallSkeleton() {
    return (
        <div className='card border border-c-light rounded-12 h-100'>
            <div className='card-body'>
                <SmallCardHeader rightPills={2} />
                <div className='d-flex flex-column gap-3 mt-2 placeholder-wave'>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className='d-flex align-items-center justify-content-between gap-3'>
                            <div className='flex-grow-1 d-flex flex-column gap-2'>
                                <div className='placeholder col-6 rounded' style={{ height: 12 }} />
                                <div className='placeholder col-5 rounded' style={{ height: 12 }} />
                            </div>
                            <div className='placeholder rounded' style={{ width: 18, height: 18 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LabelValue({ labelWidth = 'col-5', valueWidth = 'col-6' }: { labelWidth?: string; valueWidth?: string }) {
    return (
        <div className='d-flex flex-column gap-2 placeholder-wave'>
            <div className={`placeholder ${labelWidth} rounded`} style={{ height: 12 }} />
            <div className={`placeholder ${valueWidth} rounded`} style={{ height: 16 }} />
        </div>
    );
}

function AddressSmallSkeleton() {
    return (
        <div className='card border border-c-light rounded-12 h-100'>
            <div className='card-body'>
                <SmallCardHeader rightPills={1} />
                <div className='row g-3'>
                    <div className='col-6'><LabelValue labelWidth='col-6' valueWidth='col-10' /></div>
                    <div className='col-6'><LabelValue labelWidth='col-6' valueWidth='col-10' /></div>
                    <div className='col-6'><LabelValue labelWidth='col-3' valueWidth='col-7' /></div>
                    <div className='col-6'><LabelValue labelWidth='col-3' valueWidth='col-6' /></div>
                    <div className='col-6'><LabelValue labelWidth='col-3' valueWidth='col-6' /></div>
                    <div className='col-6'><LabelValue labelWidth='col-3' valueWidth='col-5' /></div>
                </div>
            </div>
        </div>
    );
}

function ContactDetailsSmallSkeleton() {
    return (
        <div className='card border border-c-light rounded-12 h-100'>
            <div className='card-body'>
                <SmallCardHeader rightPills={1} />
                <div className='row g-3'>
                    <div className='col-12'><LabelValue labelWidth='col-2' valueWidth='col-6' /></div>
                    <div className='col-12'><LabelValue labelWidth='col-4' valueWidth='col-5' /></div>
                </div>
            </div>
        </div>
    );
}

function BodyMetricsSmallSkeleton() {
    return (
        <div className='card border border-c-light rounded-12 h-100'>
            <div className='card-body'>
                <SmallCardHeader rightPills={2} />
                <div className='row g-3'>
                    <div className='col-12 col-md-4'><LabelValue labelWidth='col-4' valueWidth='col-6' /></div>
                    <div className='col-12 col-md-4'><LabelValue labelWidth='col-4' valueWidth='col-5' /></div>
                    <div className='col-12 col-md-4'><LabelValue labelWidth='col-2' valueWidth='col-3' /></div>
                </div>
            </div>
        </div>
    );
}

function MedicalHistorySmallSkeleton() {
    return (
        <div className='card border border-c-light rounded-12 h-100'>
            <div className='card-body'>
                <SmallCardHeader rightPills={1} />
                <div className='row g-3'>
                    <div className='col-12'><LabelValue labelWidth='col-3' valueWidth='col-2' /></div>
                    <div className='col-12'><LabelValue labelWidth='col-3' valueWidth='col-2' /></div>
                    <div className='col-12'><LabelValue labelWidth='col-3' valueWidth='col-8' /></div>
                </div>
            </div>
        </div>
    );
}

function LatestTreatmentSmallSkeleton() {
    return (
        <div className='card border border-c-light rounded-12 h-100'>
            <div className='card-body'>
                <SmallCardHeader rightPills={0} />
                <div className='row g-3'>
                    <div className='col-12'><LabelValue labelWidth='col-3' valueWidth='col-2' /></div>
                    <div className='col-12'><LabelValue labelWidth='col-3' valueWidth='col-2' /></div>
                    <div className='col-12'><LabelValue labelWidth='col-2' valueWidth='col-3' /></div>
                </div>
            </div>
        </div>
    );
}

function FormSkeletonCard() {
    return (
        <div className='card border border-c-light rounded-12'>
            <div className='card-body d-flex flex-column gap-3 placeholder-wave'>
                <div className='d-flex align-items-center justify-content-between'>
                    <div className='placeholder col-3 rounded' style={{ height: 16 }} />
                    <div className='d-flex align-items-center gap-2'>
                        <div className='placeholder rounded-pill' style={{ width: 160, height: 14 }} />
                        <div className='placeholder rounded-circle' style={{ width: 20, height: 20 }} />
                    </div>
                </div>

                <div className='d-flex flex-column gap-3'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className='d-flex flex-column gap-1'>
                            <div className='placeholder col-2 rounded' style={{ height: 10 }} />
                            <div className='placeholder col-5 rounded' style={{ height: 12 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FormsSkeletonSection() {
    return (
        <div className='d-flex flex-column gap-3 border border-c-light rounded-12 p-3 placeholder-wave'>
            <div className='d-flex align-items-center justify-content-between'>
                <div className='placeholder col-2 rounded' style={{ height: 18 }} />
                <div className='placeholder rounded-pill' style={{ width: 90, height: 24 }} />
            </div>
            <FormSkeletonCard />
            <FormSkeletonCard />
        </div>
    );
}

export interface PatientSidebarSkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
    showRxFormSkeleton?: boolean;
}

export default function PatientSidebarSkeleton({ showRxFormSkeleton = false }: PatientSidebarSkeletonProps) {
    return (
        <div className='d-flex flex-column gap-4'>
            <div className='d-flex align-items-center justify-content-between gap-3 placeholder-wave'>
                <div className='d-flex align-items-center gap-3 w-100'>
                    <div className='w-20'>
                        <div className='placeholder  col-12 rounded-pill' style={{ height: 24 }} />
                    </div>
                    <div>
                        <div className='placeholder rounded-pill' style={{ width: 80, height: 28 }} />
                    </div>
                </div>
            </div>

            <div className='row g-3 flex-grow-1'>
                <div className='col-12 col-lg-4'>
                    <div className='d-flex  flex-column gap-3' style={{height: 'calc(100vh - 15rem)'}}>
                        <div className='card border h-100 border-c-light rounded-12'>
                            <div className='card-body d-flex flex-column gap-3 h-100 placeholder-wave'>
                                <div className='placeholder col-4 rounded' style={{ height: 18 }} />
                                <>
                                    <div className='d-flex flex-grow-1 flex-column gap-3'>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className='d-flex align-items-start justify-content-between gap-3'>
                                                <div className='flex-grow-1 d-flex flex-column gap-2'>
                                                    <div className='placeholder col-6 rounded' style={{ height: 12 }} />
                                                    <div className='placeholder col-5 rounded' style={{ height: 12 }} />
                                                </div>
                                                <div className='placeholder rounded' style={{ width: 18, height: 18 }} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className='mt-3 d-flex justify-content-end gap-2 placeholder-wave'>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className='placeholder rounded' style={{ width: 12, height: 12 }} />
                                        ))}
                                    </div>
                                </>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='col-12 col-lg-8'>
                    <div className='row g-3'>
                        <div className='col-xl-6'>
                            <GeneralInfoSkeletonCard />
                        </div>
                        <div className='col-xl-6'>
                           <SkeletonList items={4} />
                        </div>

                        <div className='col-xl-6'>
                            <NotesSmallSkeleton />
                            
                        </div>
                        <div className='col-xl-6'>
                            <AddressSmallSkeleton />
                        </div>
                        <div className='col-xl-6'>
                            <ContactDetailsSmallSkeleton />
                        </div>
                        <div className='col-xl-6'>
                            <MedicalHistorySmallSkeleton />
                        </div>
                        <div className='col-xl-6'>
                            <BodyMetricsSmallSkeleton />
                        </div>
                        <div className='col-xl-6'>
                            <LatestTreatmentSmallSkeleton />
                        </div>
                        <div className='col-12'>
                            <FormsSkeletonSection />
                        </div>
                    </div>
                </div>
            </div>
            {/* Selected Order + Order Notes + RX form skeletons */}
            {showRxFormSkeleton ?
                <div className='d-flex flex-column gap-3 border border-c-light px-3 py-4 rounded-12'>
                    <div >
                        <SelectedOrderSkeletonCard />
                    </div>
                    <div >
                        <OrderNotesSkeletonCard />
                    </div>
                    <RxFormSkeletonCard />
                </div> : null}

        </div>
    );
}   


