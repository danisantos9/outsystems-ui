// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Providers.Splide {
	/**
	 * Defines the interface for OutSystemsUI Patterns
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export class OSUISplide
		extends OSUIFramework.Patterns.Carousel.AbstractCarousel<Splide, Splide.SplideConfig>
		implements OSUIFramework.Patterns.Carousel.ICarousel
	{
		// Store if the render callback should be prevented
		private _blockRender: boolean;
		// Store the List widget element
		private _carouselListWidgetElem: HTMLElement;
		// Store the placholder element
		private _carouselPlaceholderElem: HTMLElement;
		// Store the element that will be used to init the provider
		private _carouselProviderElem: HTMLElement;
		// Store the splide__track element from the provider
		private _carouselTrackElem: HTMLElement;
		// Store current carousel index;
		private _currentIndex: number;
		// Store the disable render async callback
		private _eventOnDisableRender: OSUIFramework.Callbacks.Generic;
		// Store the onResize event
		private _eventOnResize: OSUIFramework.Callbacks.Generic;
		// Store if a List widget is used inside the CarouselItems placeholder
		private _hasList: boolean;
		// Store the onInitialized event
		private _platformEventInitialized: OSUIFramework.Callbacks.OSCarouselOnInitializeEvent;
		// Store the onSlideMoved event
		private _platformEventOnSlideMoved: OSUIFramework.Callbacks.OSCarouselSlideMovedEvent;
		// Store initial provider options
		private _providerOptions: SplideOpts;

		constructor(uniqueId: string, configs: JSON) {
			super(uniqueId, new SplideConfig(configs));
		}

		// Method to check if a List Widget is used inside the placeholder and assign the _listWidget variable
		private _checkListWidget(): void {
			const listElements = OutSystems.OSUI.Utils.ChildrenMatches(
				this._carouselPlaceholderElem,
				OSUIFramework.Constants.Dot + OSUIFramework.GlobalEnum.CssClassElements.List
			);

			this._hasList = listElements.length > 0;

			if (this._hasList) {
				this._carouselListWidgetElem = this._selfElem.querySelector(
					OSUIFramework.Constants.Dot + OSUIFramework.GlobalEnum.CssClassElements.List
				);

				this._carouselProviderElem = this._carouselTrackElem;
			} else {
				this._carouselProviderElem = this._selfElem;
			}
		}

		// Method that encapsulates all methods needed to create a new Carousel
		private _createProviderCarousel(triggerInitialize = true): void {
			// Call the following methods here, so that all DOM elements are iterated and ready to init the library
			this._prepareCarouselItems();
			this._providerOptions = this.configs.getProviderConfig();

			// Init the Library
			this._initProvider(triggerInitialize);
		}

		// Method to toggle the blockRender status, to avoid multiple renderings triggering changeProperty
		private _disableBlockRender(): void {
			this._blockRender = false;
		}

		// Method to init the provider
		private _initProvider(triggerInitialize = true): void {
			this._provider = new window.Splide(this._carouselProviderElem, this._providerOptions);

			if (triggerInitialize) {
				// Set the OnInitialized event, before the provider is mounted
				this._setOnInitializedEvent();
			}
			// Init the provider
			this._provider.mount();

			// Set the OnSlideMoved event
			this._setOnSlideMovedEvent();

			// Set initial carousel width
			this._setCarouselWidth();
		}

		// Method to add the splide__slide class on each carousel item
		private _prepareCarouselItems(): void {
			// Define the element that has the items. The List widget if dynamic content, otherwise get from the placeholder directly
			const targetList = this._hasList ? this._carouselListWidgetElem : this._carouselPlaceholderElem;

			// Add the placeholder content already with the correct html structure per item, expected by the library
			for (const item of targetList.children) {
				if (!item.classList.contains(Enum.CssClass.SplideSlide)) {
					item.classList.add(Enum.CssClass.SplideSlide);
				}
			}
		}

		// Ensure that the splide track maintains the correct width
		private _setCarouselWidth(): void {
			// Update UI on window resize
			this.provider.refresh();

			// Update css variable
			OSUIFramework.Helper.Dom.Styles.SetStyleAttribute(
				this._carouselTrackElem,
				OSUIFramework.Patterns.Carousel.Enum.CssVariables.CarouselWidth,
				this._selfElem.offsetWidth + OSUIFramework.GlobalEnum.Units.Pixel
			);
		}

		// Method to set the OnInitializeEvent
		private _setOnInitializedEvent(): void {
			this._provider.on(Enum.SpliderEvents.Mounted, () => {
				OSUIFramework.Helper.AsyncInvocation(this._platformEventInitialized, this.widgetId);
			});
		}

		// Method to set the OnSlideMoved event
		private _setOnSlideMovedEvent(): void {
			this._provider.on(Enum.SpliderEvents.Moved, (index) => {
				if (index !== this._currentIndex) {
					OSUIFramework.Helper.AsyncInvocation(this._platformEventOnSlideMoved, this.widgetId, index);
					this._currentIndex = index;
				}
			});
		}

		/**
		 * Sets the callbacks to be used.
		 *
		 * @protected
		 * @memberof OSUISplide
		 */
		protected setCallbacks(): void {
			// Bind this to the async callback
			this._eventOnDisableRender = this._disableBlockRender.bind(this);
			this._eventOnResize = this._setCarouselWidth.bind(this);

			// Add event listener for window resize
			window.addEventListener(OSUIFramework.GlobalEnum.HTMLEvent.Resize, this._eventOnResize);
		}

		/**
		 * Method to set the html elements used
		 *
		 * @protected
		 * @memberof OSUISplide
		 */
		protected setHtmlElements(): void {
			this._carouselPlaceholderElem = OSUIFramework.Helper.Dom.ClassSelector(
				this._selfElem,
				OSUIFramework.Patterns.Carousel.Enum.CssClass.Content
			);
			this._carouselTrackElem = OSUIFramework.Helper.Dom.ClassSelector(
				this._selfElem,
				OSUIFramework.Patterns.Carousel.Enum.CssClass.Track
			);
		}

		/**
		 * Method to set the initial CSS Classes
		 *
		 * @protected
		 * @memberof OSUISplide
		 */
		protected setInitialCssClasses(): void {
			// If using Carousel with a List, get one level below on the HTML, so that the List element is used on the structure expected by the library
			// In this case, the osui-carousel won't be used, and the library will be mounted on the osui-carousel_track
			if (this._hasList) {
				OSUIFramework.Helper.Dom.Styles.AddClass(this._carouselTrackElem, Enum.CssClass.SplideWrapper);
				OSUIFramework.Helper.Dom.Styles.AddClass(this._carouselPlaceholderElem, Enum.CssClass.SplideTrack);
				OSUIFramework.Helper.Dom.Styles.AddClass(this._carouselListWidgetElem, Enum.CssClass.SplideList);
			} else {
				OSUIFramework.Helper.Dom.Styles.AddClass(this._selfElem, Enum.CssClass.SplideWrapper);
				OSUIFramework.Helper.Dom.Styles.AddClass(this._carouselTrackElem, Enum.CssClass.SplideTrack);
				OSUIFramework.Helper.Dom.Styles.AddClass(this._carouselPlaceholderElem, Enum.CssClass.SplideList);
			}
		}

		/**
		 * Unsets the callbacks.
		 *
		 * @protected
		 * @memberof OSUISplide
		 */
		protected unsetCallbacks(): void {
			this._eventOnDisableRender = undefined;
			this._eventOnResize = undefined;
			this._platformEventInitialized = undefined;
			this._platformEventOnSlideMoved = undefined;

			// remove event listener
			window.removeEventListener(OSUIFramework.GlobalEnum.HTMLEvent.Resize, this._eventOnResize);
		}

		/**
		 * Unsets the HTML elements.
		 *
		 * @protected
		 * @memberof OSUISplide
		 */
		protected unsetHtmlElements(): void {
			this._carouselPlaceholderElem = undefined;
			this._carouselTrackElem = undefined;
		}

		/**
		 * Method to build the pattern.
		 *
		 * @memberof OSUISplide
		 */
		public build(): void {
			super.build();

			this.setHtmlElements();

			this.setCallbacks();

			this._checkListWidget();

			this.setInitialCssClasses();

			this._createProviderCarousel();

			this.finishBuild();
		}

		/**
		 * Method to change the value of configs/current state.
		 *
		 * @param {string} propertyName
		 * @param {unknown} propertyValue
		 * @memberof OSUISplide
		 */
		public changeProperty(propertyName: string, propertyValue: unknown): void {
			super.changeProperty(propertyName, propertyValue);

			if (this.isBuilt) {
				// Block UpdateOnRender to avoid multiple triggers of provider.refresh()
				this._blockRender = true;

				switch (propertyName) {
					case OSUIFramework.Patterns.Carousel.Enum.Properties.StartingPosition:
						console.warn(
							`Carousel (${this.widgetId}): changes to ${OSUIFramework.Patterns.Carousel.Enum.Properties.StartingPosition} parameter do not affect the carousel. Use the client action 'CarouselGoTo' to change the current item.`
						);
						break;
					case OSUIFramework.Patterns.Carousel.Enum.Properties.Navigation:
					case OSUIFramework.Patterns.Carousel.Enum.Properties.AutoPlay:
					case OSUIFramework.Patterns.Carousel.Enum.Properties.Loop:
					case OSUIFramework.Patterns.Carousel.Enum.Properties.ItemsDesktop:
					case OSUIFramework.Patterns.Carousel.Enum.Properties.ItemsTablet:
					case OSUIFramework.Patterns.Carousel.Enum.Properties.ItemsPhone:
						this.updateCarousel();
						break;
					case OSUIFramework.Patterns.Carousel.Enum.Properties.Height:
						this._provider.options = { height: propertyValue as string | number };
						break;
					case OSUIFramework.Patterns.Carousel.Enum.Properties.Padding:
						this._provider.options = { padding: propertyValue as string | number };
						break;
					case OSUIFramework.Patterns.Carousel.Enum.Properties.ItemsGap:
						this._provider.options = { gap: propertyValue as string | number };
						break;
				}
			}

			// Unblock UpdateOnRender so that it is able to update on DOM changes inside Carousel content
			OSUIFramework.Helper.AsyncInvocation(this._eventOnDisableRender, this.widgetId);
		}

		/**
		 * Method to remove and destroy Carousel Splide instance
		 *
		 * @memberof OSUISplide
		 */
		public dispose(): void {
			// Check if provider is ready
			if (this.isBuilt) {
				this._provider.destroy();
			}

			this.unsetCallbacks();
			this.unsetHtmlElements();

			super.dispose();
		}

		/**
		 * Method to call the go API from the provider
		 *
		 * @param {number} index
		 * @memberof OSUISplide
		 */
		public goTo(index: number): void {
			this._provider.go(index);
		}

		/**
		 * Method to call the go API from the provider. With '>' it will go to the next page
		 *
		 * @memberof OSUISplide
		 */
		public next(): void {
			this._provider.go(Enum.Go.Next);
		}

		/**
		 * Method to call the go API from the provider. With '<' it will go to the previous page
		 *
		 * @memberof OSUISplide
		 */
		public previous(): void {
			this._provider.go(Enum.Go.Previous);
		}

		/**
		 * Set callbacks for the onChange event
		 *
		 * @param {string} eventName
		 * @param {OSUIFramework.Callbacks.OSGeneric} callback
		 * @memberof OSUISplide
		 */
		public registerProviderCallback(eventName: string, callback: OSUIFramework.Callbacks.OSGeneric): void {
			switch (eventName) {
				case OSUIFramework.Patterns.Carousel.Enum.CarouselEvents.OnSlideMoved:
					this._platformEventOnSlideMoved = callback;
					break;
				case OSUIFramework.Patterns.Carousel.Enum.CarouselEvents.Initialized:
					this._platformEventInitialized = callback;
					break;
			}
		}

		/**
		 * Method to call the option API from the provider to toggle drag events
		 *
		 * @param {boolean} hasDrag
		 * @memberof OSUISplide
		 */
		public toggleDrag(hasDrag: boolean): void {
			this._provider.options = { drag: hasDrag };
		}

		/**
		 * Method used on the changeProperty for the options that require the Carousel to be destroyd and created again to properly update
		 *
		 * @param {boolean} [keepCurrentIndex=true]
		 * @param {boolean} [triggerInitialize=true]
		 * @memberof OSUISplide
		 */
		public updateCarousel(keepCurrentIndex = true, triggerInitialize = true): void {
			// Check if provider is ready
			if (typeof this._provider === 'object') {
				this._provider.destroy();
			}

			if (keepCurrentIndex) {
				// Keep same position after update
				this.configs.StartingPosition = this._currentIndex;
			}
			// Create Carousel again
			this._createProviderCarousel(triggerInitialize);
		}

		/**
		 * Method to run when there's a platform onRender
		 *
		 * @memberof OSUISplide
		 */
		public updateOnRender(): void {
			if (!this._blockRender) {
				this.setInitialCssClasses();

				// Check if provider is ready
				if (typeof this._provider === 'object') {
					this.updateCarousel(false, false);
				}
			}
		}
	}
}