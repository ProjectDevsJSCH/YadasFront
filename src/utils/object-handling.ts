export default {
  filterKeys(mapping: any, array: Array<any>) {
    return array.map((element) => {
      const keys = Object.keys(mapping);

      return keys.reduce((prev: any, curr: string) => {
        prev[mapping[curr]] = element[curr];

        return prev;
      }, {});
    });
  },
};
