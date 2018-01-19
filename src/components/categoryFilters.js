import filtersHTML from "./categoryFilters.html";

/**
 * A vue component. The filter list rendered for a
 * particular collection. Takes data and events from the
 * master controller config.
 *
 * @param  {Object} data   collection data
 * @param  {Object} events pub sub events
 * @memberof collectionListController
 * @name categoryFilters
 * @returns {Object}        for use as a Vue component
 */

const categoryFilters = (data, events) => {
    const navButton = {
        el: "#filter-ui",
        template: `
            <div id="filter-ui" v-on:click="handleClick">
                <span class="filter-ui__icon">
                    <svg width="44" height="44" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1595 295q17 41-14 70l-493 493v742q0 42-39 59-13 5-25 5-27 0-45-19l-256-256q-19-19-19-45v-486l-493-493q-31-29-14-70 17-39 59-39h1280q42 0 59 39z"/></svg>
                </span>
                <span class="filter-ui__label">{{ label }}</span>
                <span v-on:click="handleClick" v-if="isActive" class="filter-ui__category">{{ currentFilter }}</span>
                <span v-on:click="handleClick" v-else class="filter-ui__category">All</span>
            </div>
        `,
        data () {
            return {
                label: "Filter By ",
                currentFilter: "All",
                isActive: false
            };
        },
        methods: {
            handleClick (e) {
                events.emit("filter-ui-clicked", (e));
            }
        },
        mounted () {
            events.on("filter-set", (e) => {
                this.currentFilter = e.filterName;
                if (e.filterName === "All") {
                    this.isActive = false;
                } else {
                    this.isActive = true;
                }
            });
        }
    };

    const list = {
        template: filtersHTML,
        data () {
            return {
                transitionActive: false,
                isActive: false,
                categories: data.collection.categories
            };
        },
        methods: {

            /**
             * Waits for the component to be rendered, then
             * allows interaction with the DOM.
             *
             * @private
             */

            setFilter (filter) {
                events.emit("filter-set", { filterName: filter });
                this.closeMenu();
            },
            resetFilters () {
                events.emit("filter-set", { filterName: "All" });
            },
            openMenu () {
                document.body.classList.add("disable-scroll");
                this.isActive = true;
            },
            closeMenu () {
                document.body.classList.remove("disable-scroll");
                this.transitionActive = true;
                setTimeout(() => {
                    this.isActive = false;
                    this.transitionActive = false;
                }, 500);
            }
        },
        mounted () {
            events.on("filter-ui-clicked", () => {
                this.openMenu();
            });
        }
    };

    return {
        navButton,
        list
    };
};

export default categoryFilters;