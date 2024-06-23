import library from './library';

const emojify = (string: string): string => {
  return (string || '').trim().replace(/\n/g, ' \n').split(' ')
    .map(value => {
      if (value && value.length > 2 && value[0] === ':' && value[value.length - 1] === ':') {
        return value.split(':')
          .filter(val => Boolean(val))
          .map(val => library.hasOwnProperty(val) ? library[val] : `:${val}:`)
          .join('');
      } else {
        return value;
      }
    })
    .join(' ').replace(/ \n/g, '\n');
}

export default emojify;