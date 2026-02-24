'use client';

import { Component } from 'react';
import { MdOutlineDragIndicator } from 'react-icons/md';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';

interface ItemProps {
  item: PublicPharmacy;
  commonProps: {
    pharmacies: PublicPharmacy[];
    onPharmacyReorder: (newOrder: PublicPharmacy[]) => void;
  };
  dragHandleProps: {
    onMouseDown: () => void;
    onTouchStart: () => void;
  };
  itemSelected: number;
}

export class DraggablePharmacyItem extends Component<ItemProps> {
  render() {
    const scale = this.props.itemSelected * 0.05 + 1;
    const pharmacy = this.props.item;

    return (
      <div
        style={{ transform: `scale(${scale})` }}
        className='gap-2 d-flex align-items-center overflow-hidden tw-bg-white tw-rounded tw-border-dashed tw-border-[3px] tw-border-gray-300 tw-p-2'
      >
        <MdOutlineDragIndicator
          className='dragHandle text-muted cursor-pointer'
          size={20}
          style={{ cursor: 'grab' }}
          {...this.props.dragHandleProps}
        />
        <span className='tw-capitalize md:tw-text-lg'>{pharmacy.name}</span>
      </div>
    );
  }
}
