'use strict';


function fetchUrl (fetch, url, fetchOptions) {
    return fetch(url, fetchOptions)
        .then((res) => {
            if (res.status < 200 || res.status >= 300) {
                throw new Error('The source url response status is not OK');
            }
            return res.json();
        });
}

module.exports = fetchUrl;
