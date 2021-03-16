function Box(x) {
    return x ? [x] : [];
}

function Lazy(exec) {
    return new Proxy(Box(exec), {
        get(o, k) {
            return (
                {
                    exec,
                    map(fn) {
                        return Lazy(() => exec().then(fn));
                    },
                    flatMap(fn) {
                        return Lazy(() => exec().then((x) => fn(x).exec()));
                    },
                }[k] || o[k]
            );
        },
    });
}

module.exports = {
    Box,
    Lazy,
};
