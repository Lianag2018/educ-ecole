// French number names make the spoken model explicit, including embedded zeroes.
export function numberWords(n){
 if(!Number.isInteger(n)||n<0||n>1999)throw new RangeError('Nombre attendu : de 0 à 1999');
 const small=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
 if(n<17)return small[n];
 if(n<20)return 'dix-'+small[n-10];
 if(n<70){const d=Math.floor(n/10),r=n%10;return ['','','vingt','trente','quarante','cinquante','soixante'][d]+(r===1?' et un':r?'-'+small[r]:'');}
 if(n<80)return n===71?'soixante et onze':'soixante-'+numberWords(n-60);
 if(n<100)return n===80?'quatre-vingts':'quatre-vingt-'+numberWords(n-80);
 if(n<1000){const c=Math.floor(n/100),r=n%100;return (c===1?'cent':small[c]+' cent'+(!r?'s':''))+(r?' '+numberWords(r):'');}
 return 'mille'+(n%1000?' '+numberWords(n%1000):'');
}
// Short spoken groups let every number be heard clearly without 2,000 API calls.
export function numberParts(n){
 numberWords(n);
 if(n===0)return ['zéro'];
 const parts=[];if(n>=1000)parts.push('mille');
 const rest=n%1000,hundreds=Math.floor(rest/100)*100,units=rest%100;
 if(hundreds)parts.push(numberWords(hundreds));
 if(units)parts.push(numberWords(units));
 return parts;
}
