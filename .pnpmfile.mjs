const pnpmfile = {
  hooks: {
    readPackage(pkg, _context) {
      return pkg
    },
  },
}

export default pnpmfile
