export default function BrandMark() {
  return (
    <div className="relative w-8 h-8 sm:w-9 sm:h-9 text-[#7c3aed] -translate-y-[1px] shrink-0">
      <svg
        className="absolute inset-0 block"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
          fill="currentColor"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-white text-[19px] sm:text-[21px] font-extrabold leading-none select-none -translate-y-[0.5px]">
        $
      </span>
    </div>
  );
}
