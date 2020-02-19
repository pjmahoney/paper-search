import { PolymerElement, html } from '@polymer/polymer';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-checkbox/paper-checkbox.js';

class PaperFilterDialog extends PolymerElement {

    static get template() {
        return html`
<style>
    .dialog {
        @apply --paper-filter-dialog;
        --paper-dialog-background-color: var(--paper-filter-dialog-background-color);
    }

    app-toolbar {
        @apply --paper-filter-toolbar;
        --app-toolbar-background: var(--paper-filter-toolbar-background);
    }

    paper-button {
        font-size: initial;
    }

    .dialog,.page {
        @apply --layout-fit;
    }

    .page {
        @apply --layout-vertical;
        margin: 0;
        padding: 0;
    }

    .list {
        @apply --layout-flex;
    }

    .filter {
        border-bottom: 1px solid var(--divider-color);
    }

    .filter,.value {
        cursor: pointer;
        background: white;
    }

    /** Workaround for IE11 to center column */
    .filter-body {
        height: 1px;
    }

    /**
     * Workaround for IE11 to center column
     * @see https://github.com/PolymerElements/paper-item/pull/65/commits/b41815d6f147a52755fc6db188a3f32a329640ee
     */
    .value-holder {
        @apply --layout-vertical;
    }

    .nrResults {
        color: var(--secondary-text-color);
    }
</style>

<array-selector id="selector" items="{{filters}}" selected="{{_selectedFilter}}"></array-selector>
<paper-dialog id="dialog" class="dialog">
    <template is="dom-if" if="{{!_selectedFilter}}">
        <div class="page">
            <app-toolbar>
                <paper-icon-button on-tap="close" icon="close"></paper-icon-button>
                <span main-title></span>
                <paper-button on-tap="_tapReset" class="reset" hidden$="[[!_hasSelectedFilters(_selectedFilters)]]">[[resetButton]]</paper-button>
                <paper-button on-tap="_tapApply" dialog-confirm>[[saveButton]]</paper-button>
            </app-toolbar>

            <iron-list items="[[filters]]" as="filter" class="list">
                <template>
                    <paper-item class="filter" on-tap="_tapSelectFilter">
                        <paper-ripple fit></paper-ripple>
                        <paper-item-body two-line class="filter-body">
                            <div class="name">[[filter.name]]</div>
                            <div secondary>[[_getSelectedValuesNames(filter, _selectedFilters)]]</div>
                        </paper-item-body>
                    </paper-item>
                </template>
            </iron-list>
        </div>
    </template>
    <template is="dom-if" if="{{_selectedFilter}}">
        <div class="page">
            <app-toolbar>
                <paper-icon-button icon="arrow-back" on-tap="_tapSelectValues"></paper-icon-button>
                <span main-title>[[_selectedFilter.name]]</span>
            </app-toolbar>

            <iron-list id="valuesList" items="[[_selectedFilterValues]]" as="filterValue" class="list">
                <template>
                    <div class="value-holder">
                        <paper-item class="value">
                            <paper-checkbox name="[[filterValue.id]]" checked="{{filterValue.selected}}"></paper-checkbox>
                            <div>
                                [[filterValue.name]]
                                <span class="nrResults" hidden="[[!filterValue.count]]">([[filterValue.count]])</span>
                            </div>
                        </paper-item>
                    </div>
                </template>
            </iron-list>
        </div>
    </template>
</paper-dialog>
        `;
    }

    static get is() {
        return 'paper-filter-dialog';
    }

    static get properties() {
        return {
            /**
             * All filters from which the user can choose
             */
            filters: Array,
            /**
             * All filters that have been selected by the user, e.g. `{ age: [ "child", "teen" ] }`
             */
            selectedFilters: {
                type: Object,
                notify: true,
                value: {}
            },

            /**
             * Text for the reset button. Use this property to localize the element.
             */
            resetButton: {
                type: String,
                value: 'Reset'
            },

            /**
             * Text for the save button. Use this property to localize the element.
             */
            saveButton: {
                type: String,
                value: 'Save filters'
            },

            /**
             * Label shown if no values are selected for a filter. Use this property to localize the element.
             */
            noValuesLabel: {
                type: String,
                value: 'No filters yet'
            },

            /**
             * Internal copy that is changed. Copied back to original variable only once the user clicks on [Apply]
             */
            _selectedFilters: {
                type: Object,
                value: {}
            },
            _selectedFilter: Object,
            _selectedFilterValues: {
                type: Array,
                value: []
            }
        }
    }

    // Public methods
    /**
     * Opens the filter dialog
     */
    open() {
        // Attach dialog to the body to ensure it's on top of all existing overlays
        // XXX - Known issue: this generates addEventListener errors from a11y
        document.body.appendChild(this);

        // Wait until dialog is added to the DOM (required for Safari)
        setTimeout(function () {
            this.$.dialog.open();

            // Clone selected filters, so it can be changed without touching the external property
            this._selectedFilters = Object.assign({}, this.selectedFilters);
        }.bind(this), 1);
    }

    close() {
        this.$.dialog.close();
    }

    /**
     * Handles if the user taps on a filter
     */
    _tapSelectFilter(e) {
        this.$.selector.select(e.model.filter);

        this._preselectFilterValues();
    }

    /**
     * Separate function for unit testing
     */
    _preselectFilterValues() {
        // Check all values that are selected
        const selectedValueIds = this._selectedFilters[this._selectedFilter.id];
        const isSelected = function (value) {
            return Boolean(selectedValueIds) && selectedValueIds.indexOf(value.id) >= 0;
        };
        this._selectedFilterValues = this._selectedFilter.values.map(function (value) {
            return Object.assign({}, value, {
                selected: isSelected(value)
            });
        });
    }

    _tapReset(e) {
        this._selectedFilters = {};
    }

    _tapApply(e) {
        this.selectedFilters = this._selectedFilters;

        this.dispatchEvent(new CustomEvent('save', { detail: { kicked: true } }));
    }

    _tapSelectValues(e) {
        // Captured IDs of the selected items
        const selectedValues = this._selectedFilterValues.filter(function (value) {
            return value.selected;
        }).map(function (value) {
            return value.id;
        });
        this._selectedFilters = Object.assign({}, this._selectedFilters, {
            [this._selectedFilter.id]: selectedValues
        });

        this.$.selector.deselect(this._selectedFilter);
    }

    /**
     * True if any filter was set
     * @param  {[type]} selectedFilters  [description]
     * @return {[type]}                   [description]
     */
    _hasSelectedFilters(selectedFilters) {
        // Iterate until we find a filter that is selected
        for (selectedFilter in selectedFilters) {
            if (selectedFilters[selectedFilter].length > 0) {
                return true;
            }
        }

        return false;
    }

    // Returns the concated names of the selected values for a specific filter
    _getSelectedValuesNames(filter, _selectedFilters) {
        const selectedValueIds = _selectedFilters[filter.id];
        if (!filter.values || !selectedValueIds) {
            return this.noValuesLabel;
        }

        // Capture names of all selected values
        const names = filter.values.filter(function (value) {
            // Only consider values that are selected
            return selectedValueIds.indexOf(value.id) >= 0;
        }).map(function (value) {
            // Capture name of the selected value
            return value.name;
        });

        return names.length > 0 ? names.join(', ') : this.noValuesLabel;
    }
}

customElements.define(PaperFilterDialog.is, PaperFilterDialog);
