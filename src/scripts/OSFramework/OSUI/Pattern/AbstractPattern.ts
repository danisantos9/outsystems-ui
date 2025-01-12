// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSUI.Patterns {
	/**
	 * Defines the Default props and methods for OutSystemsUI Patterns
	 *
	 * @export
	 * @abstract
	 * @class AbstractPattern
	 * @implements {Interface.IPattern}
	 * @template C
	 */
	export abstract class AbstractPattern<C extends AbstractConfiguration> implements Interface.IPattern {
		// Pattern configurations (doubling as current state). Extends AbstractConfiguration.
		private _configs: C;
		// Indicates if the pattern has been built or not.
		private _isBuilt = false;
		//  Reference for the base HTML of the element of this pattern;
		private _selfElem: HTMLElement;
		// Id generated by us, and added to the HTML to uniquely identify a pattern.
		private _uniqueId: string;
		// Id of the widget. This will be the Id that the developer will be using in runtime.
		private _widgetId: string;

		constructor(uniqueId: string, configs: C) {
			this._uniqueId = uniqueId;
			this._configs = configs;
		}

		//  Sets the HTML elements, by setting the references and the attributes.
		private _setCommonHtmlElements(): void {
			this._selfElem = Helper.Dom.GetElementByUniqueId(this._uniqueId);
			this._widgetId = this._selfElem.closest(GlobalEnum.DataBlocksTag.DataBlock).id;

			if (this._configs.ExtendedClass !== '') {
				Helper.Dom.Styles.ExtendedClass(this._selfElem, '', this._configs.ExtendedClass);
			}
		}

		// Unsets the refences to the HTML elements.
		private _unsetCommonHtmlElements(): void {
			this._selfElem = undefined;
		}

		/**
		 * Marks the built as being finished.
		 *
		 * @protected
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		protected finishBuild(): void {
			//In the future we can trigger an initialized event.
			this._isBuilt = true;
		}

		/**
		 * Builds the pattern.
		 *
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public build(): void {
			this._setCommonHtmlElements();
		}

		/**
		 * Changes the value of the properties in the configurations and
		 * if changes are to a common property, applies the changes.
		 *
		 * @param {string} propertyName
		 * @param {unknown} propertyValue
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public changeProperty(propertyName: string, propertyValue: unknown): void {
			if (this._configs.hasOwnProperty(propertyName)) {
				if (this._isBuilt) {
					switch (propertyName) {
						case GlobalEnum.CommonPatternsProperties.ExtendedClass:
							Helper.Dom.Styles.ExtendedClass(
								this._selfElem,
								this._configs.ExtendedClass,
								propertyValue as string
							);
							break;
					}
				}
				//First we used the previous value of the ExtendedClass config.
				//then we update it or any other config.
				//We also need to validate if the property can be changed.
				if (this._configs.validateCanChange(this._isBuilt, propertyName)) {
					//If the property can be changed, we then validate if the default value should be applied or not.
					this._configs[propertyName] = this._configs.validateDefault(propertyName, propertyValue);
				}
			} else {
				throw new Error(`changeProperty - Property '${propertyName}' can't be changed.`);
			}
		}

		/**
		 * Disposes the pattern.
		 *
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public dispose(): void {
			this._isBuilt = false;
			this._unsetCommonHtmlElements();
			this._configs = undefined;
		}

		/**
		 * Enables to uniquely identify the pattern in all ways.
		 *
		 * @param {string} patternId
		 * @return {*}  {boolean}
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public equalsToID(patternId: string): boolean {
			return patternId === this._uniqueId || patternId === this._widgetId;
		}

		/**
		 * Getter that allows to obtain the accessibility is enabled.
		 *
		 * @readonly
		 * @protected
		 * @type {boolean}
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		//TODO: getter to remove.
		protected get _enableAccessibility(): boolean {
			return Helper.DeviceInfo.HasAccessibilityEnabled;
		}

		/**
		 * Getter that allows to obtain the self element.
		 *
		 * @readonly
		 * @type {(HTMLElement | undefined)}
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public get selfElement(): HTMLElement {
			return this._selfElem;
		}

		/**
		 * Getter that tells if the pattern is already built.
		 *
		 * @readonly
		 * @type {boolean}
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public get isBuilt(): boolean {
			return this._isBuilt;
		}

		/**
		 * Current configurations/state of the pattern.
		 *
		 * @readonly
		 * @type {C}
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public get configs(): C {
			return this._configs;
		}

		/**
		 * Unique id of the pattern. Internal use only.
		 *
		 * @readonly
		 * @type {string}
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public get uniqueId(): string {
			return this._uniqueId;
		}

		/**
		 * Id of the pattern known by the developer. External use only.
		 *
		 * @readonly
		 * @type {string}
		 * @memberof OSFramework.Patterns.AbstractPattern
		 */
		public get widgetId(): string {
			return this._widgetId;
		}

		// Common methods all patterns must implement
		protected abstract setA11YProperties(): void;
		protected abstract setCallbacks(): void;
		protected abstract setHtmlElements(): void;
		protected abstract unsetCallbacks(): void;
		protected abstract unsetHtmlElements(): void;
	}
}
