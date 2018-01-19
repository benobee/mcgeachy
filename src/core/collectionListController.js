import Vue from "vue";
import collectionList from "../components/collectionList";
import categoryFilters from "../components/categoryFilters";
import util from "../util/util";
import Events from "../core/events";
import jsonData from "../../data.json";

/**
 * Pub Sub Events
 * @type {Events}
 */

const events = new Events();

/**
 * All obects, components, event listeners localized to the portfolio list view
 * @type {Object}
 * @memberof App
 * @name collectionListController
 */

const collectionListController = {
    init (parent) {
        this.config = {
            parent
        };

        this.data = {};

        util.getData(this.config.parent.dataset.collectionUrl, (response) => {
            if (!response.error) {
                this.initializeVueComponents(response.data);
            } else {
                this.initializeVueComponents(jsonData);
            }
        });
    },
    initializeVueComponents (data) {
        const filterComponents = categoryFilters(data, events);

        Vue.component("collection-items", collectionList(data, events));
        Vue.component("category-filters", filterComponents.list);

        const filterList = new Vue({
            el: "#collection-filters-vue"
        });

        const navButton = new Vue(filterComponents.navButton);

        const items = new Vue({
            el: "#collection-items-vue"
        });

        return {
            navButton,
            filterList,
            items
        };
    }
};

export default collectionListController;