export function filterStyles(styles: PaintStyle[], searchPhrase: string): PaintStyle[] {
  if (searchPhrase) {
    let search: RegExp;

    if (searchPhrase.startsWith('/') && searchPhrase.endsWith('/')) {
      search = new RegExp(searchPhrase);
    }

    return styles.filter((style) => {
      if (search) {
        return search.exec(style.name)
      }

      return style.name.includes(searchPhrase as string);
    });
  }

  return styles;
}