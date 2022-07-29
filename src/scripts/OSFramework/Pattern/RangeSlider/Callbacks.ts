// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Patterns.RangeSlider.Callbacks {
	export type OSInitializeEvent = {
		(rangeSliderId: string): void;
	};

	export type OSOnValueChangeEvent = {
		(rangeSliderId: string, startValue: number, endValue: number): void;
	};
}