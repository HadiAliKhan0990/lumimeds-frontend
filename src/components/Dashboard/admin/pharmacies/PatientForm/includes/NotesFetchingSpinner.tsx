import { Spinner } from 'react-bootstrap';


export interface NotesFetchingSpinnerProps extends React.ComponentPropsWithoutRef<'div'> {
    isFetchingPharmacyNotes: boolean
}

export const NotesFetchingSpinner = ({ isFetchingPharmacyNotes, ...props }: NotesFetchingSpinnerProps) => {
    return (isFetchingPharmacyNotes && (

        <div className='position-absolute top-0 end-0 p-2' {...props}>
            <Spinner size='sm' />
        </div>
    ))
}