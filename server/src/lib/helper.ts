export const includeTagLevel = {
  parent: {
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
    },
  },
  children: {
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
  },
};
