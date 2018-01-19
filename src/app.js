import collectionlistController from "./core/collectionlistController";

/**
 * App shell pattern. Looks for specific classnames
 * in the body, stores the HTML and executes init scripts.
 *
 * @type {Object}
 * @name App
 */

const App = {
    init () {
        this.cacheDOM();
        this.execute();
    },
    cacheDOM () {
        this.articles = document.querySelector("#e-letters");
    },
    execute () {
        if (this.articles) {
            collectionlistController.init(this.articles);
        }
    }
};

window.onload = App.init();