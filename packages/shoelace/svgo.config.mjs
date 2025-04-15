export default {
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'minifyStyles',
    'sortAttrs',
    'sortDefsChildren',
    'removeDimensions',
    'removeViewBox',
    {
      name: 'convertColors',
      params: {
        currentColor: true,
        names2hex: true,
        rgb2hex: true,
        convertCase: 'lower',
        shorthex: true,
        shortname: true
      }
    }
  ]
};
