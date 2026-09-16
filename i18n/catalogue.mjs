import messages from './messages.json' with {type:'json'};
import {translations} from './translations.mjs';
export const locales=['en','it','fr','es','pt-BR'];
export const nativeNames={en:'English',it:'Italiano',fr:'Français',es:'Español','pt-BR':'Português (Brasil)'};
const names=[106,108,110,112,114,152,198,225];
export function dictionary(locale) {
 const col=locales.indexOf(locale)-1;
 if(locale==='en')return Object.fromEntries(messages.map(s=>[s,s]));
 if(col<0)throw new Error('Unsupported locale: '+locale);
 const map=Object.fromEntries(messages.flatMap((s,i)=>translations[i]?[[s,translations[i][col]]]:[]));
 map.Heading='Heading';
 map.South='South';
 // Keep elided articles with their noun across the designed heading line break.
 if(locale==='it'){map['Find the']='Trova';map['opportunity.']='l’opportunità.';}
 if(locale==='fr'){map['Find the']='Trouvez';map['opportunity.']='l’opportunité.';}
 const capability=['Competenza','Expertise','Capacidad','Competência'][col];
 const sector=['Settore','Secteur','Sector','Setor'][col];
 const first=['Primo focus','Premier domaine d’action','Primer foco','Foco inicial'][col];
 const example=['Esplora un esempio: ','Explorez un exemple : ','Explora un ejemplo: ','Explore um exemplo: '][col];
 for(const id of names){
  const name=messages[id],translated=map[name];
  map[name+' — Heading South']=translated+' — Heading South';
  map['Capability / '+name]=capability+' / '+translated;
  map['Sector / '+name]=sector+' / '+translated;
  map['Sector / '+name+' · First focus']=sector+' / '+translated+' · '+first;
  map['Explore a '+name+' example']=example+translated;
  map[name+' editorial image']=map['editorial image']+' — '+translated;
  map['Explore '+name]=map.Explore+' '+translated;
  for(const source of messages)if(source.startsWith(name+': ')){
   const tail=source.slice(name.length+2);if(map[tail])map[source]=translated+': '+map[tail];
  }
 }
 const missing=messages.filter(s=>!map[s]);
 if(missing.length)throw new Error('Missing '+locale+' translations: '+JSON.stringify(missing));
 return map;
}
export {messages};
