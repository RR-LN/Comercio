/**
 * removeAfromLink.js
 *
 * Este script remove elementos <a> aninhados dentro de <Link> do Next.js,
 * adaptando para a nova abordagem sem aninhar <a>.
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Encontra todos os elementos Link que contêm um elemento <a> como filho
  return root
    .find(j.JSXElement, {
      openingElement: {
        name: {
          name: 'Link'
        }
      }
    })
    .forEach(path => {
      const linkElement = path.node;
      
      // Verifica se há um elemento <a> como filho direto
      if (linkElement.children.some(child => 
        child.type === 'JSXElement' && 
        child.openingElement.name.name === 'a'
      )) {
        // Obtém o elemento <a>
        const aElement = linkElement.children.find(child => 
          child.type === 'JSXElement' && 
          child.openingElement.name.name === 'a'
        );

        // Transfere os atributos do <a> para o Link
        if (aElement && aElement.openingElement.attributes) {
          linkElement.openingElement.attributes = [
            ...linkElement.openingElement.attributes,
            ...aElement.openingElement.attributes.filter(attr => 
              attr.name.name !== 'href' // Evita duplicar o href
            )
          ];
        }

        // Transfere os filhos do <a> diretamente para o Link
        if (aElement) {
          linkElement.children = aElement.children;
        }
      }
    })
    .toSource();
};