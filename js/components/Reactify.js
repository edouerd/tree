import TreeStore from '../stores/TreeStore.js';
import LoadComponent from './LoadComponent';

const recl = React.createClass;
const rele = React.createElement;
const load = React.createFactory(LoadComponent);

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}

const name = (displayName, component) => _.extend(component, {
  displayName,
});

const walk = (root, _nil, _str, _comp) => {
  // manx: {fork: ["string", {gn:"string" ga:{dict:"string"} c:{list:"manx"}}]}
  const step = (elem, key) => {
    let left;
    switch (false) {
      case !(elem == null):
        return _nil();
      case typeof elem !== 'string':
        return _str(elem);
      case (elem.gn == null): {
        const { gn, ga } = elem;
        let { c } = elem;
        c = ((left = __guard__(c, x => x.map(step)))) != null ? left : [];
        return _comp.call(elem, {
          gn,
          ga,
          c
        }, key);
      }
      default:
        throw new Error(`Bad react-json ${JSON.stringify(elem)}`);
    }
  };
  return step(root);
};

const DynamicVirtual = recl({
  displayName: 'DynamicVirtual',
  getInitialState() {
    return this.stateFromStore();
  },

  stateFromStore() {
    return {
      components: TreeStore.getVirtualComponents(),
    };
  },

  onChangeStore() {
    if (this.isMounted()) {
      return this.setState(this.stateFromStore());
    }
    return null;
  },

  componentDidMount() {
    return TreeStore.addChangeListener(this.onChangeStore);
  },

  componentWillUnmount() {
    return TreeStore.removeChangeListener(this.onChangeStore);
  },

  render() {
    return (Virtual(
      _.extend({}, this.props, {
        components: this.state.components,
      }),
    ));
  },
});

const Virtual = name('Virtual', ({
    manx,
    components,
    basePath,
  }) =>
  walk(manx,
    () => load({}, ''),
    str => str,
    ({ gn, ga, c }, key) => {
      const props = { key };
      if (__guard__(ga, x => x.style)) {
        try {
          ga.style = eval(`(${ga.style})`);
        } catch (e) {
          ga.style = ga.style;
        }
      }
      if (components[gn]) {
        props.basePath = basePath;
      }
      return rele((components[gn] != null ? components[gn] : gn),
        (_.extend(props, ga)),
        c.length ? c : undefined);
    }),
);

const reactify = (manx, key, param) => {
  if (param == null) { param = {}; }
  const { basePath, components } = param;
  let component = {};
  if (components != null) {
    component = rele(Virtual, {
      manx,
      key,
      basePath,
      components,
    });
  } else {
    component = rele(DynamicVirtual, {
      manx,
      key,
      basePath,
    });
  }
  return component;
};

export default _.extend(reactify, {
  walk,
  Virtual,
});
