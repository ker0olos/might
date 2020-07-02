/**
* @param { string } color
* @param { number } opacity
*/
export function opacity(color, opacity)
{
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function getTheme()
{
  const light = {
    whiteBackground: '#ffffff',
    whiteText: '#ffffff',

    blackBackground: '#000000',
    blackText: '#000000',
    blackShadow: opacity('#000000', 0.25),

    accent: '#888888',

    transparent: 'transparent',

    blue: '#1abfe8',
    red: '#de3e3e'
  };

  return light;
}