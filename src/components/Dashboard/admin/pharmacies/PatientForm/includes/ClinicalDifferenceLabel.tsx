import React from 'react'


// test
export interface clinicalDifferenceLabelProps extends React.ComponentPropsWithoutRef<'div'> {
    label: string;
    onClickClinicalDifferenceStatement: (toggle: boolean) => void;
    isProductSelected: boolean;
}
export const ClinicalDifferenceLabel = ({ label, onClickClinicalDifferenceStatement, isProductSelected }: clinicalDifferenceLabelProps) => {
    return (
        <label className='form-label d-flex justify-content-between'>
            <span>
                {label}
            </span>
            <span onClick={() => onClickClinicalDifferenceStatement(true)} className={`text-decoration-underline ${isProductSelected ? "text-primary" : "text-muted"}  text-small cursor-pointer`} >
                Clinical Difference Statement
            </span>
        </label>
    )
}
