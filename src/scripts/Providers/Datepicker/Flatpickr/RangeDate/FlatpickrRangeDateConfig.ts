/// <reference path="../AbstractFlatpickrConfig.ts" />

/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Providers.Datepicker.Flatpickr.RangeDate {
	/**
	 * Class that represents the custom configurations received by the Datepicker RangeDate mode.
	 *
	 * @export
	 * @class FlatpickrRangeDateConfig
	 * @extends {AbstractFlatpickrConfig}
	 */
	export class FlatpickrRangeDateConfig extends AbstractFlatpickrConfig {
		// Set the property EndDate
		public InitialEndDate: string;
		// Set the property StartDate
		public InitialStartDate: string;

		constructor(config: JSON) {
			super(config);

			this.calendarMode = OSUIFramework.Patterns.DatePicker.Enum.Mode.Range;
		}

		// Method used to set the default value since we're dealing with on input to be assigned and 2 received dates!
		private _setDefaultDate(): string[] | undefined {
			// Check if any of the given dates are a null date
			if (
				OSUIFramework.Helper.Dates.IsNull(this.InitialStartDate) ||
				OSUIFramework.Helper.Dates.IsNull(this.InitialEndDate)
			) {
				return undefined;
			}

			// Check if the Start Date is after than End Date
			if (OSUIFramework.Helper.Dates.Compare(this.InitialStartDate, this.InitialEndDate) === false) {
				throw new Error(`StartDate '${this.InitialStartDate}' can't be after EndDate '${this.InitialEndDate}'`);
			}

			return [this.InitialStartDate, this.InitialEndDate];
		}

		// Method used to set all the config properties for the RangeDate mode type
		public getProviderConfig(): FlatpickrOptions {
			const flatpickrRangeDateOpts = {
				defaultDate: this._setDefaultDate(),
				mode: OSUIFramework.Patterns.DatePicker.Enum.Mode.Range,
			};

			// Merge both option objects => if objects have a property with the same name, then the right-most object property overwrites the previous one
			// eslint-disable-next-line prefer-const
			let fpOptions = {
				...super.getCommonProviderConfigs(),
				...flatpickrRangeDateOpts,
			};

			// Cleanning undefined properties
			Object.keys(fpOptions).forEach((key) => fpOptions[key] === undefined && delete fpOptions[key]);

			return fpOptions;
		}

		public validateDefault(key: string, value: unknown): unknown {
			let validatedValue = undefined;

			switch (key) {
				case Enum.Properties.InitialStartDate:
					validatedValue = false;
					break;
				case Enum.Properties.InitialEndDate:
					validatedValue = false;
					break;
				default:
					validatedValue = super.validateDefault(key, value);
					break;
			}

			return validatedValue;
		}
	}
}