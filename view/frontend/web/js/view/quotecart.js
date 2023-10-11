(function () {
    'use strict';

    $.view('quotecart', {
        component: 'Amasty_RequestQuote/js/view/quotecart',
        defaults: {
            template: 'Swissup_BreezeAmastyRequestQuote/quotecart/content',
        },
        shouldRender: ko.observable(false),
        isLoading: ko.observable(false),
        displaySubtotal: ko.observable(true),
        shoppingCartUrl: '#',
        maxItemsToDisplay: window.amasty_quote_cart.maxItemsToDisplay,
        cart: {},
        addToCartCalls: 0,
        minicartSelector: '[data-block="quotecart"]',

        create: function () {
            var self = this,
                cartData = $.sections.get('quotecart');

            this.subTotal = cartData;

            this.update(cartData());
            this.cartSubscription = cartData.subscribe(function (updatedCart) {
                self.addToCartCalls--;
                self.isLoading(self.addToCartCalls > 0);
                self.update(updatedCart);
                self.initSidebar();
            });

            this.minicart()
                .one('dropdownDialog:open', function () {
                    self.shouldRender(true);
                })
                .on('dropdownDialog:open', function () {
                    self.initSidebar();
                })
                .on('contentLoading', function () {
                    self.addToCartCalls++;
                    self.isLoading(true);
                })
                .on('contentSkipped', function () {
                    self.addToCartCalls--;
                    self.isLoading(self.addToCartCalls > 0);
                });

            if (window.checkout && cartData().website_id !== window.amasty_quote_cart.websiteId) {
                $.sections.reload(['quotecart'], false);
            }
        },

        destroy: function () {
            this.cartSubscription.dispose();
            this._super();
        },

        minicart: function () {
            return $(this.minicartSelector);
        },

        initSidebar: function () {
            var minicart = this.minicart(),
                sidebar = minicart.sidebar('instance');

            minicart.trigger('contentUpdated');

            if (sidebar) {
                return sidebar.update();
            }

            if (!$('[data-role=product-item]').length) {
                return false;
            }

            minicart.sidebar(this.getSidebarSettings());
        },

        getSidebarSettings: function () {
            return {
                'targetElement': 'div.block.block-quotecart',
                'url': {
                    'checkout': window.amasty_quote_cart.checkoutUrl,
                    'update': window.amasty_quote_cart.updateItemQtyUrl,
                    'remove': window.amasty_quote_cart.removeItemUrl,
                    'loginUrl': window.amasty_quote_cart.customerLoginUrl,
                    'isRedirectRequired': window.amasty_quote_cart.isRedirectRequired
                },
                'button': {
                    'checkout': '#top-quotecart-button',
                    'remove': '#quote-cart a.action.delete',
                    'close': '#btn-quotecart-close'
                },
                'showcart': {
                    'parent': 'span.counter',
                    'qty': 'span.counter-number',
                    'label': 'span.counter-label'
                },
                'minicart': {
                    'list': '#quote-cart',
                    'content': '#quotecart-content-wrapper',
                    'qty': 'div.items-total',
                    'subtotal': 'div.subtotal span.price',
                    'maxItemsVisible': window.amasty_quote_cart.minicartMaxItemsVisible
                },
                'item': {
                    'qty': 'input.cart-item-qty',
                    'button': 'button.update-cart-item'
                },
                'confirmMessage': $.__('Are you sure you would like to remove this item from the quote cart?')
            };
        },

        closeMinicart: function () {
            this.minicart().find('[data-role="dropdownDialog"]').dropdownDialog('close');
        },

        /**
         * @return {Boolean}
         */
        closeSidebar: function () {
            var minicart = this.minicart();

            minicart.on('click', '[data-action="close"]', function (event) {
                event.stopPropagation();
                minicart.find('[data-role="dropdownDialog"]').dropdownDialog('close');
            });

            return true;
        },

        /**
         * @param {Object} item
         * @return {*|String}
         */
        getItemRenderer: function (item) {
            var renderer = this.options.itemRenderer[item.product_type];

            if (renderer && document.getElementById(renderer)) {
                return renderer;
            }

            return 'defaultRenderer';
        },

        /**
         * @param {Object} updatedCart
         */
        update: function (updatedCart) {
            _.each(updatedCart, function (value, key) {
                if (!this.cart.hasOwnProperty(key)) {
                    this.cart[key] = ko.observable();
                }
                this.cart[key](value);
            }, this);
        },

        /**
         * @param {String} name
         * @return {*}
         */
        getCartParamUnsanitizedHtml: function (name) {
            if (!_.isUndefined(name)) {
                if (!this.cart.hasOwnProperty(name)) {
                    this.cart[name] = ko.observable();
                }
            }

            return this.cart[name]();
        },

        /**
         * @param {String} name
         * @return {*}
         */
        getCartParam: function (name) {
            return this.getCartParamUnsanitizedHtml(name);
        },

        /**
         * Returns array of cart items, limited by 'maxItemsToDisplay' setting
         * @return []
         */
        getCartItems: function () {
            var items = this.getCartParamUnsanitizedHtml('items') || [];

            items = items.slice(parseInt(-this.maxItemsToDisplay, 10));

            return items;
        },

        /**
         * @return {Number}
         */
        getCartLineItemsCount: function () {
            var items = this.getCartParamUnsanitizedHtml('items') || [];

            return parseInt(items.length, 10);
        }
    });
})();
