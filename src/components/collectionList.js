import itemHTML from "./collectionList.html";
import util from "../util/util";
import Image from "./image";

/**
 * Vue component config for infinite scrolling
 * and list filtering
 *
 * @param  {Object} data   from site collection
 * @param  {Object} events pub sub events
 * @memberof collectionListController
 * @name collectionList
 * @returns {Object}        compiled vue object config
 */

const collectionList = (data, events) => {
    return {
        components: {
            "item-image": Image
        },
        template: itemHTML,
        data () {
            return {
                currentFilter: "All",
                fullUrl: data.collection.fullUrl,
                items: data.items,
                scrollHeight: 0,
                disableScroll: false,
                scrollBottom: false,
                pagination: {
                    scrollBottom: false,
                    pageLimit: 6,
                    currentIndex: 0
                },
                isLoading: false,
                lifecycle: {
                    appLoaded: false
                }
            };
        },
        filters: {

            /**
             * Useful classnames for rendered items.
             * @memberof collectionList
             * @name applyItemClasses
             * @private
             */

            applyItemClasses (item) {
                const itemClassNames = [];

                if (item.categories && item.categories.length > 0) {
                    item.hasCategories = true;
                    itemClassNames.push("has-categories");
                    itemClassNames.push(item.categories.map((category) => `category-${util.slugify(category)}`).join(" "));
                }

                if (item.tags && item.tags.length > 0) {
                    item.hasTags = true;
                    itemClassNames.push("has-tags");
                    itemClassNames.push(item.tags.map((tag) => `tag-${util.slugify(tag)}`).join(" "));
                }

                if (item.colorData) {
                    itemClassNames.push("has-image");
                }

                if (itemClassNames.length > 0) {
                    itemClassNames.join(" ");
                }

                return itemClassNames;
            },

            /**
             * Formats the image url to the available
             * squarespace resolutions.
             *
             * @param  {Object} width
             * @memberof collectionList
             * @name suggestedColor
             * @returns {String}
             * @private
             */

            suggestedColor (colorData) {
                return {
                    backgroundColor: `#${colorData.suggestedBgColor}`
                };
            },
            formatSmall (img) {
                return `${img }?format=300w`;
            }
        },
        computed: {
            list () {
                /* this is the main rendered list outputted to
                the DOM target area */

                //clone the array
                let array = this.items.slice(0);

                if (this.currentFilter !== "All") {
                    //store cloned list of items in category
                    array = array.slice(0);

                    //filter the array from search criteria
                    array = array.filter((item) => {
                        let match = false;

                        if (item.categories && item.categories.indexOf(this.currentFilter) !== -1) {
                            match = item;
                        }

                        return match;
                    });
                }

                //paginate the array
                array = this.paginate(array);

                return array;
            },
            isScrolling () {
                let scrolling = false;

                if (this.scrollHeight < this.listTop) {
                    scrolling = true;
                }

                return scrolling;
            },
            appLoaded () {
                let className = "";

                if (this.lifecycle.appLoaded) {
                    className = "data-loaded";
                }

                return className;
            }
        },
        methods: {

            /**
             * The state of the scroll and items will be
             * stored in the history state for a smoother
             * user experience.
             *
             * @memberof collectionList
             * @name storeListState
             * @private
             */

            storeListState (options) {
                options.scrollRestoration = "auto";
                history.pushState(options, null, location.pathname + location.search);
            },
            paginate (array) {
                //limit the active items list based on page index to allow for
                //infinite scroll and append
                array = array.splice(0, this.pagination.currentIndex + this.pagination.pageLimit);

                return array;
            },
            bindScrollEvents () {
                window.addEventListener("load", this.executeScrollFunctions);
                window.addEventListener("scroll", this.executeScrollFunctions);
            },
            cleanupScrollEvents () {
                window.removeEventListener("load", this.executeScrollFunctions);
                window.removeEventListener("scroll", this.executeScrollFunctions);
            },

            /**
             * Tests whether the collection list is at the bottom or not.
             *
             * @memberof collectionList
             * @name executeScrollFunctions
             * @private
             */

            executeScrollFunctions () {
                const grid = this.$el.querySelector(".collection-list");
                const height = window.innerHeight;
                const domRect = grid.getBoundingClientRect();
                const triggerAmount = height - domRect.bottom + 500;
                const body = document.body.getBoundingClientRect();

                this.scrollHeight = body.top;

                //show next page of pagination list
                this.appendItems(triggerAmount);
            },

            scrollTo (scrollY) {
                window.scroll({
                    top: scrollY,
                    left: 0
                });
            },

            /**
             * when the page is scrolled to the bottom of the current items
             * the next set or page of items will be auto appened to the bottom
             *
             * @param  {Number} triggerAmount
             * @memberof collectionList
             * @name appendItems
             * @private
             */

            appendItems (triggerAmount) {
                //when the page is scrolled to the bottom of the current items
                //the next set or page of items will be auto appened to the bottom
                if (triggerAmount > 0 && !this.pagination.scrollBottom) {
                    this.pagination.scrollBottom = true;
                    const current = this.pagination.currentIndex;

                    this.pagination.currentIndex = current + this.pagination.pageLimit + 1;
                    this.pagination.scrollBottom = false;
                }
            },

            /**
             * Makes HTTP call to the specified collection with
             * squarespace category filters. Loads new list with
             * loading screen.
             *
             * @param  {String} filter
             * @memberof collectionList
             * @name filterByCategory
             * @private
             */

            filterByCategory () {
                this.pagination.currentIndex = 0;
                this.progressLoaderIsActive(false);
            },

            /**
             * A well mannered tale about the history of the browser
             * from page to page that changes categories by the last
             * filter in the state object.
             *
             * @memberof collectionList
             * @name listenToHistoryLesson
             * @private
             */

            listenToHistoryLesson () {
                window.addEventListener("popstate", (e) => {
                    if (e.state) {
                        events.emit("filter-set", {
                            filterName: e.state.currentFilter,
                            popstate: true
                        });
                    }
                });
            },

            /**
             * A simple on / off loader. The div has been placed outside the
             * Vue component.
             *
             * @param  {Bool} loaderState
             * @memberof collectionList
             * @name progressLoaderIsActive
             * @private
             */

            progressLoaderIsActive (loaderState) {
                if (loaderState) {
                    document.querySelector(".progress-loader").classList.remove("load-complete");
                } else {
                    document.querySelector(".progress-loader").classList.add("load-complete");
                }
            },

            /**
             * Queries the location search for specific parameter.
             *
             * @param  {String} name
             * @memberof collectionList
             * @name getUrlParameter
             * @returns {String}
             * @private
             */

            getUrlParameter (name) {
                name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");

                const regex = new RegExp(`[\\?&]${ name }=([^&#]*)`);
                const results = regex.exec(location.search);

                return results === null ? "" : decodeURIComponent(results[ 1 ].replace(/\+/g, " "));
            },

            /**
             * Looks at the location search params and sets the filter
             * accordingly.
             *
             * @memberof collectionList
             * @name checkUrlForFilter
             * @private
             */

            checkUrlForFilter () {
                const search = this.getUrlParameter("category");

                if (search) {
                    this.currentFilter = search;
                    events.emit("filter-set", { filterName: search });
                } else {
                    events.emit("filter-set", { filterName: "All" });
                    this.currentFilter = "All";
                    this.storeListState({
                        currentFilter: this.currentFilter
                    });
                }
            },

            encodeShareUrl (value) {
                return `${location.pathname}?category=${encodeURIComponent(value)}`;
            }
        },
        mounted () {
            this.progressLoaderIsActive(true);
            this.checkUrlForFilter();
            this.listenToHistoryLesson();
            events.on("filter-set", (e) => {
                this.progressLoaderIsActive(true);

                this.currentFilter = e.filterName;
                if (!e.popstate) {
                    if (e.filterName === "All") {
                        history.pushState({ currentFilter: "All" }, null, location.pathname);
                    } else {
                        history.pushState({ currentFilter: e.filterName }, null, this.encodeShareUrl(e.filterName));
                    }
                }

                setTimeout(() => {
                    this.filterByCategory(e);
                }, 1000);
            });

            setTimeout(() => {
                this.bindScrollEvents();
                this.lifecycle.appLoaded = true;
                this.progressLoaderIsActive(false);
            }, 1200);
        }
    };
};

export default collectionList;