function extendGridTemplateColumns() {
  const fillValueOptions = [
    '50px',
    '100px',
    '200px',
    '300px',
  ];

  const fillValues = fillValueOptions.reduce((obj, option, index) => {
    obj[`fill-${index + 1}`] = `repeat(auto-fill, minmax(${option}, 1fr))`;

    return obj;
  }, {});

  return {
    ...fillValues,
  };
}

module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
  ],
  variants: {},
  theme: {
    extend: {
      gridTemplateColumns: {
        fill: 'repeat(auto-fill, minmax(0, 1fr))',
        ...extendGridTemplateColumns(),
      },
    },
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
