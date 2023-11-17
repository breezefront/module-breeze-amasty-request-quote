(function () {
    'use strict';

    $.mixin('catalogAddToCart', {
        options: {
            addToQuoteButtonTextWhileAdding: '',
            addToQuoteButtonDisabledClass: 'disabled'
        },
        selectors: {
            addToQuoteButtonText: '.amquote-addto-button-text',
            quoteCart: '',
            addToQuoteButton: '[data-amquote-js="addto-button"]'
        },
        quoteButtonText: {
            added: $t('Added'),
            addToQuote: $t('Add to Quote'),
            adding: $t('Adding...')
        },

        ajaxSubmit: function (original, form) {
            var isAddToQuote = form.attr('data-amquote-js'),
                isLogged = form.attr('data-amquote-logged') === '1';

            if (isAddToQuote) {
                if (isLogged) {
                    this.ajaxSubmitQuote(form);
                } else {
                    form.append(
                        $('<input>').attr('type', 'hidden')
                            .attr('name', 'return_url_quote_added')
                            .val('amasty_quote/cart')
                    );
                    this.postSubmitForm(form, true);
                }
            } else {
                original(form);
            }
        },

        /**
         * @param {String} form
         * @return {void}
         */
        ajaxSubmitQuote: function (form) {
            var self = this;

            $(self.selectors.quoteCart).trigger('contentLoading');
            self.disableAddToQuoteButton(form);

            if (self.isLoaderEnabled()) {
                $('body').trigger(self.options.processStart);
            }

            $.ajax({
                url: form.attr('action'),
                data: form.serialize(),
                type: 'post',
                dataType: 'json',

                complete: function () {
                    self.enableAddToQuoteButton(form);

                    if (self.isLoaderEnabled()) {
                        $('body').trigger(self.options.processStop);
                    }
                },
                success: function (data, response) {
                    var res = self.getResponseData(response);

                    $(document).trigger('ajax:addToQuote', {
                        'sku': form.data().productSku,
                        'form': form,
                        'response': res
                    });

                    if (res.backUrl) {
                        if (res.backUrl === window.location.href) {
                            window.location.reload();
                        } else {
                            window.location.assign(res.backUrl);
                        }

                        return;
                    }

                    if (res.messages) {
                        $(self.options.messagesSelector).html(res.messages);
                    }

                    if (res.quotecart) {
                        $(self.selectors.quoteCart).replaceWith(res.quotecart);
                        $(self.selectors.quoteCart).trigger('contentUpdated');
                    }

                    if (res.product && res.product.statusText) {
                        $(self.options.productStatusSelector)
                            .removeClass('available')
                            .addClass('unavailable')
                            .find('span')
                            .html(res.product.statusText);
                    }
                }
            });
        },

        /**
         * @param {String} form
         * @param {boolean} quote
         * @return {void}
         */
        postSubmitForm: function (form, quote) {
            this.element.off('submit');
            if (quote) {
                this.disableAddToQuoteButton(form);
            } else {
                // disable 'Add to Cart' button
                var addToCartButton = $(form).find(this.options.addToCartButtonSelector);
                addToCartButton.prop('disabled', true);
                addToCartButton.addClass(this.options.addToCartButtonDisabledClass);
            }
            form.submit();
        },

        /**
         * Disables and changes button text
         *
         * @param {String} form
         * @return {void}
         */
        disableAddToQuoteButton: function (form) {
            var addToQuoteButton = $(form).find(this.selectors.addToQuoteButton);

            addToQuoteButton.addClass(this.options.addToQuoteButtonDisabledClass);
            addToQuoteButton.find(this.selectors.addToQuoteButtonText).text(this.quoteButtonText.adding);
            addToQuoteButton.attr('title', this.quoteButtonText.adding);
        },

        /**
         * @param {String} toCartForm
         * @return {void}
         */
        enableAddToQuoteButton: function (toCartForm) {
            var addToQuoteButton = $(toCartForm).find(this.selectors.addToQuoteButton);

            addToQuoteButton.find(this.selectors.addToQuoteButtonText).text(this.quoteButtonText.added);
            addToQuoteButton.attr('title', this.quoteButtonText.added);
            this.setDefaultTitle(toCartForm);
        },

        /**
         * Sets a default title with a timeout so that the transition from adding to added is visible
         *
         * @param {String} toCartForm
         * @return {void}
         */
        setDefaultTitle: _.debounce(function(toCartForm){
            var addToQuoteButton = $(toCartForm).find(this.selectors.addToQuoteButton);

            addToQuoteButton.removeClass(this.options.addToQuoteButtonDisabledClass);
            addToQuoteButton.find(this.selectors.addToQuoteButtonText).text(this.quoteButtonText.addToQuote);
            addToQuoteButton.attr('title', this.quoteButtonText.addToQuote);
            addToQuoteButton.blur();
        }, 1000)
    });
})();
