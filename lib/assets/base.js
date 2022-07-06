'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class Base {
    main;
    inited;
    constructor(main) {
        this.main = main;
    }
    generateAttributes(attributes) {
        if (Array.isArray(attributes)) {
            return attributes
                .map((attribute) => {
                    if ((attribute.trait_type || attribute.name) && attribute.value) {
                        return {
                            key: attribute.trait_type || attribute.name,
                            value: attribute.value,
                        };
                    } else {
                        return null;
                    }
                })
                .filter((attribute) => attribute);
        }
    }
}
exports.default = Base;
