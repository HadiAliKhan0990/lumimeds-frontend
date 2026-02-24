interface Props {
  title: React.ReactNode;
  icon: React.ReactNode;
  description: string;
  titleRef?: (el: HTMLDivElement | null) => void;
  fixedTitleHeight?: number | null;
}

export default function PlanCard({ title, icon, description, titleRef, fixedTitleHeight }: Readonly<Props>) {
  return (
    <div className='plan_card'>
      <div
        ref={titleRef}
        className='all_plans_card_title text-center text-light fw-medium text-4xl mb-3'
        style={fixedTitleHeight ? { height: fixedTitleHeight } : {}}
      >
        {title}
      </div>
      <div className='plan_card_icon'>{icon}</div>
      <p className='m-0 text-white text-center all_plans_card_subtext'>{description}</p>
    </div>
  );
}
