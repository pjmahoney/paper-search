import {PolymerElement, html} from '@polymer/polymer';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {IronA11yKeysBehavior} from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/iron-input/iron-input.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-badge/paper-badge.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/default-theme.js';

class PaperSearchBar extends mixinBehaviors([IronA11yKeysBehavior], PolymerElement)  {
    static get template() {
        return html`
<style>
    :host {
        display: block;
    }

    .horizontal-holder {
        background: var(--background-color, white);
        display: block;
        padding: 0 16px;
        @apply --layout-horizontal;
        @apply --layout-center-center;
        height: var(--paper-search-bar-height, 48px); /* To resolve \`min-height\` bug on IE 11 */
        box-sizing: border-box;
    }

    iron-input {
        @apply --layout-flex;
        @apply --layout-vertical;
        height: 100%; /* To resolve \`min-height\` bug on IE 11 */
    }

    .icon {
        color: var(--disabled-text-color);
        @apply --icon-styles;
    }

    #input {
        @apply --layout-flex;
        margin: 0 10px;
        padding: 16px 0;
        cursor: text;
        background: transparent;
        color: inherit;
        @apply --input-styles;
        border: 0;
        outline: 0;
    }
    #input::-ms-clear {
        display: none;
    }

    #input[disabled] {
        @apply --disabled-input-styles;
    }

    .badge {
        --paper-badge-background: var(--paper-red-500);
        --paper-badge-opacity: 1;
        --paper-badge-width: 18px;
        --paper-badge-height: 18px;
        --paper-badge-margin-left: -5px;
        --paper-badge-margin-bottom: -25px;
    }

    .badge[invisible] {
        visibility: hidden;
    }
</style>

<div class="horizontal-holder">
    <iron-icon icon="[[icon]]" class="icon"></iron-icon>
    <iron-input bind-value="{{query}}">
        <!-- Define is="iron-input" for backwards compatibility with Polymer 1.x -->
        <input id="input" is="iron-input" placeholder="[[placeholder]]" value="{{value::input}}"></input>
    </iron-input>

    <template is="dom-if" if="{{query}}">
        <paper-icon-button icon="clear" on-tap="_clear" class="icon"></paper-icon-button>
    </template>
    <template is="dom-if" if="{{!hideFilterButton}}">
        <template is="dom-if" if="{{!disableFilterButton}}">
            <paper-icon-button id="filter" icon="image:tune" on-tap="_filter" class="icon"></paper-icon-button>
        </template>
        <paper-badge for="filter" label="[[nrSelectedFilters]]" class="badge" invisible$="[[!nrSelectedFilters]]"></paper-badge>
    </template>
</div>`;
    };


    static get is() {
        return 'paper-search-bar';
    }

    static get properties() {
        return {
            /**
             * Text for which the user is searching
             */
            query: {
                type: String,
                notify: true,
                value: ''
            },
            /**
             * Whether to hide the Filter button. Set attribute "hide-filter-button" to do so.
             */
            hideFilterButton: {
                type: Boolean,
                value: false
            },
            /**
             * Whether to disable the Filter button. Set attribute "disable-filter-button" to do so.
             */
            disableFilterButton: {
                type: Boolean,
                value: false
            },
            /**
             * Number of filters the user has been selected (shown in the badge) (optional)
             */
            nrSelectedFilters: {
                type: Number,
                value: 0
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

            keyBindings: {
                'enter': '_search'
            },
        }
    }

    focus() {
        this.$.input.focus();
    }

    // Private methods
    _filter(e) {
        this.dispatchEvent(new CustomEvent('paper-search-filter', {detail: {kicked: true}}));
    }
    _clear() {
        this.query = "";
        this.$.input.focus();
        this.dispatchEvent(new CustomEvent('paper-search-clear', {detail: {kicked: true}}));
    }
    _search() {
        this.dispatchEvent(new CustomEvent('paper-search-search', {detail: {kicked: true}}));
    }
}
customElements.define(PaperSearchBar.is, PaperSearchBar);
