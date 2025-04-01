/**
 * Converte uma string em um slug amigável para URL
 * Ex: "Série Legal (2021)" -> "serie-legal-2021"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase() // Converte para minúsculas
    .trim() // Remove espaços no início e fim
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '') // Remove caracteres especiais
    .replace(/--+/g, '-') // Remove hífens duplicados
    .replace(/^-+/, '') // Remove hífen no início
    .replace(/-+$/, ''); // Remove hífen no fim
}
