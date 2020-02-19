import { PolymerElement, html } from '@polymer/polymer';

import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-styles/default-theme.js';
import 'paper-more-button/paper-more-button.js';

import './paper-search-bar.js';
import './paper-filter-dialog.js';

class PaperSearchPanel extends PolymerElement {
    static get template() {
        return html`
<style>
    :host,.items {
        @apply --layout-vertical;
    }

    .search {
        border-bottom: 1px solid #eee;
    }

    .noResults {
        padding: 20px;
    }

    .more {
        padding: 10px 0;
        text-align: center;
    }

    .filter-dialog {
        --paper-filter-dialog-background-color: #eee;
        --paper-filter-toolbar-background: var(--paper-grey-200);
        --paper-filter-dialog: {
            margin: 0!important;
        };
        --paper-filter-toolbar: {
            color: var(--paper-grey-900);
        }
    }
</style>

<paper-search-bar
    id="paperSearchBar"
    class="search"
    icon="[[icon]]"
    placeholder="[[placeholder]]"
    hide-filter-button="[[hideFilterButton]]"
    disable-filter-button="[[_disableFilterButton(filters)]]"
    query="{{search}}"
    nr-selected-filters="[[_getNrSelectedFilters(selectedFilters)]]"
    on-paper-search-search="_onSearch"
    on-paper-search-filter="_onFilter">
</paper-search-bar>
<paper-filter-dialog
    id="filterDialog"
    class="filter-dialog"
    filters="[[filters]]"
    selected-filters="{{selectedFilters}}"
    reset-button="[[resetButton]]"
    save-button="[[saveButton]]"
    no-values-label="[[noValuesLabel]]">
</paper-filter-dialog>

<template is="dom-if" if="{{_hasItems}}">
    <div class="items flex">
        <slot select=":not([fixed])"></slot>
    </div>
</template>

<slot select="[fixed]"></slot>

<template is="dom-if" if="{{_showNoResults(_hasItems,loading)}}">
    <div class="noResults">[[noResultsText]]</div>
</template>

<template is="dom-if" if="{{hasMore}}">
    <div class="more">
        <paper-more-button has-more="[[hasMore]]" loading="[[loading]]" on-tap-more="_loadMore">[[moreButton]]</paper-more-button>
    </div>
</template>
        `;
    }

    static get is() {
        return 'paper-search-panel';
    }

    static get properties() {
        return {
            /**
             * Query for which the user was searching
             */
            search: {
                type: String,
                observer: '_onChangeRequest',
                notify: true
            },
            /**
             * All filters from which the user can choose
             */
            filters: Object,
            /**
             * All filters that have been selected by the user, e.g. `{ age: [ "child", "teen" ] }`
             */
            selectedFilters: {
                type: Object,
                observer: '_onChangeRequest',
                notify: true,
                value: {}
            },
            /**
             * Items that are currently shown in the lister
             */
            items: Array,
            /**
             * True if further items could be loaded
             */
            hasMore: {
                type: Boolean,
                value: false
            },

            /**
             * True if items are currently loaded
             */
            loading: {
                type: Boolean,
                value: false
            },

            /**
             * Whether to hide the Filter button. Set attribute "hide-filter-button" to do so.
             */
            hideFilterButton: {
                type: Boolean,
                value: false
            },

            /**
             * Number of items loaded per page (i.e. for each click on [more])
             */
            count: {
                type: Number,
                notify: true,
                value: 20
            },
            /**
             * Icon shown in the search background
             */
            icon: {
                type: String,
                value: 'search'
            },
            /**
             * Text shown in the search box if the user didn't enter any query
             */
            placeholder: {
                type: String,
                value: 'Search'
            },

            /**
             * Text shown if no results are found. Use this property to localize the element.
             */
            noResultsText: {
                type: String,
                value: 'No matching results found.'
            },

            /**
             * Text for the more button to load more data. Use this property to localize the element.
             */
            moreButton: {
                type: String,
                value: 'More'
            },

            /**
             * Text for the reset button in the filter dialog. Use this property to localize the element.
             */
            resetButton: String,

            /**
             * Text for the save button in the filter dialog. Use this property to localize the element.
             */
            saveButton: String,

            /**
             * Label shown if no values are selected for a filter. Use this property to localize the element.
             */
            noValuesLabel: String,

            _hasItems: {
                type: Boolean,
                computed: '_computeHasItems(items)',
                value: false
            }
        };
    }

    getPaperSearchBarInstance() {
        return this.$.paperSearchBar;
    }

    // Private methods
    _loadMore() {
        this.count += 20;

        this._updateData();
    }

    _computeHasItems(items) {
        return typeof items !== 'undefined' && items.length > 0;
    }

    _showNoResults(_hasItems, loading) {
        return !_hasItems && !loading;
    }

    _onChangeRequest(newValue, oldValue) {
        // Ignore initial setting of properties (caller is supposed to trigger this call automatically)
        if (typeof oldValue !== 'undefined') {
            // Set back to default to avoid endless listers
            this.count = 20;
            this._updateData();
        }
    }

    _updateData() {
        this.dispatchEvent(new CustomEvent('change-request-params', { detail: { kicked: true } }));
    }

    _onFilter() {
        this.$.filterDialog.open();
    }

    _onSearch() {
        this.dispatchEvent(new CustomEvent('search', { detail: { kicked: true } }));
    }

    // Counts the selected filters
    _getNrSelectedFilters(selectedFilters) {
        if (Object.keys(selectedFilters).length <= 0) {
            return 0;
        }

        return Object.keys(selectedFilters)
            .map(function (key) {
                // Returns number of selected value for a filter
                return selectedFilters[key].length;
            })
            .reduce(function (sum, value) {
                // Sum up the selected values across filters
                return sum + value;
            });
    }

    _disableFilterButton(filters) {
        return !(filters && filters.length > 0);
    }
}

customElements.define(PaperSearchPanel.is, PaperSearchPanel);
