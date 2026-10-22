import {firstSounds,firstBlends,firstWords} from './first-reading.js';
const q=(id,skill,level,prompt,text,choices,answer,explanation)=>({id,skill,level,prompt,text,choices,answer,explanation});
export const skills={syllabes:'Les syllabes',sons:'Les sons et leurs lettres',mots:'Les mots',liaisons:'Les liaisons',intonation:'La voix',comprehension:'Les histoires'};
export const bank=[
q('sy1','syllabes',1,'Assemble les syllabes.','la + pin',['lapin','sapin','patin'],0,'la et pin forment le mot « lapin ». On entend deux syllabes.'),
q('sy2','syllabes',1,'Quel mot commence par la syllabe « ma »?','ma',['vélo','matin','tapis'],1,'Dans « matin », on entend ma, puis tin.'),
q('sy3','syllabes',2,'Assemble les trois syllabes.','pa + ra + sol',['parasol','parfum','parc'],0,'Un parasol protège du soleil : pa, ra, sol.'),
q('so1','sons',1,'Dans quel mot entend-on le son « ou »?','ou',['lune','roue','robe'],1,'Dans « roue », les lettres ou font le son /u/.'),
q('so2','sons',1,'Quel mot contient le son « ch »?','ch',['chat','sac','lac'],0,'Dans « chat », ch forme un seul son, comme dans « chou ».'),
q('so3','sons',2,'Quel mot contient le même son nasal que « pain »?','pain',['main','lune','pomme'],0,'Pain et main se terminent par le même son nasal.'),
q('so4','sons',2,'Quel groupe de lettres complète « bateau »?','bat…',['ou','eau','oi'],1,'Dans bateau, eau fait le son « o ».'),
q('mo1','mots',1,'Trouve le mot qui désigne un animal.','Lis les trois mots.',['table','chat','sac'],1,'Le chat est un animal.'),
q('mo2','mots',1,'Complète la phrase.','Je bois de l’…',['arbre','eau','été'],1,'L’eau est une boisson. On dit : « Je bois de l’eau. »'),
q('mo3','mots',2,'Choisis le mot qui convient.','Nous mettons nos bottes dans la…',['neige','lampe','chaise'],0,'Au Québec, on met ses bottes pour marcher dans la neige.'),
q('li1','liaisons',1,'Quel son relie « les » à « amis »?','les amis',['z','t','aucun'],0,'La liaison est obligatoire ici : les‿amis, avec le son z. Le s ne se prononce pas « s ».'),
q('li2','liaisons',2,'Quel son relie « un » à « arbre »?','un arbre',['z','n','t'],1,'La liaison est obligatoire : un‿arbre, avec le son n.'),
q('li3','liaisons',2,'Quel son relie « petit » à « ours »?','un petit ours',['t','z','aucun'],0,'Devant le nom ours, l’adjectif petit fait la liaison : petit‿ours, avec t.'),
q('in1','intonation',1,'Quelle phrase pose une question?','Observe les signes.',['Tu viens.','Tu viens?','Tu viens!'],1,'Le point d’interrogation indique une question. Essaie de la lire avec une voix qui questionne.'),
q('in2','intonation',1,'Quel signe termine une exclamation?','Quelle belle cabane…',['.','?','!'],2,'Le point d’exclamation marque ici l’émerveillement.'),
q('in3','intonation',2,'Où faire une petite pause?','Dans mon sac, je mets une pomme.',['Après « sac »','Après « une »','Après « mon »'],0,'La virgule après sac invite à faire une petite pause.'),
q('co1','comprehension',1,'Que met Zoé dans sa poche?','Zoé marche près du lac. Elle trouve une plume. Elle la met dans sa poche. Puis elle rentre à la maison.',['Une roche','Une plume','Une pomme'],1,'« Elle la met dans sa poche » : la remplace la plume.'),
q('co2','comprehension',1,'Pourquoi Lili prend-elle ses bottes?','Lili regarde dehors. La neige couvre la cour. Elle prend ses bottes et son manteau. Elle veut faire un petit bonhomme.',['Pour aller dans la neige','Pour dormir','Pour lire au lit'],0,'La neige couvre la cour. Les bottes lui permettent de sortir pour jouer.'),
q('co3','comprehension',2,'Pourquoi Sami revient-il au jardin?','Sami sème trois graines. Chaque matin, il apporte un peu d’eau. Un jour, une pousse sort de terre. Sami sourit. Demain, il reviendra avec son arrosoir.',['Pour cueillir des pommes','Pour arroser sa pousse','Pour chercher son chat'],1,'Sami prend soin de ses graines, puis de sa pousse. Son arrosoir sert à lui donner de l’eau.'),
q('co4','comprehension',3,'Que comprend Nora à la fin?','Nora veut bâtir une cabane. Son premier mur tombe. Elle ajoute une base plus large et demande à Émile de tenir les branches. Cette fois, le mur reste debout. Nora lui réserve une place dans la cabane.',['Que travailler ensemble peut aider','Que les branches sont inutiles','Que sa cabane est terminée'],0,'Avec une meilleure base et l’aide d’Émile, Nora réussit à faire tenir le mur. Le texte ne dit pas que toute la cabane est terminée.')
];

// Model sounds in French words, not ambiguous bare letter names.
const oralModels={
 so1:{spokenText:'Écoute le son dans le mot loup. Loup.',prompt:'Écoute « loup ». Quel mot contient le même son à la fin?',explanation:'Écoute : loup, roue. On entend le même son à la fin. Il s’écrit avec les lettres o et u.'},
 so2:{spokenText:'Écoute le début du mot chou. Chou.',prompt:'Quel mot commence comme « chou »?',explanation:'Écoute : chou, chat. On entend le même son au début. Les lettres c et h représentent ce son ensemble.'},
 so3:{spokenText:'Du pain. Le pain.',prompt:'Quel mot rime avec « pain »?',explanation:'Écoute : du pain, une main. Ces mots riment. On entend le même son à la fin.'},
 so4:{spokenText:'Un bateau.',prompt:'Quelles lettres terminent le mot « bateau »?',explanation:'Dans bateau, les lettres e, a et u représentent ensemble le son que tu entends à la fin du mot vélo.'}
};
for(const item of bank)Object.assign(item,oralModels[item.id]||{});

bank.push(...firstSounds,...firstBlends,...firstWords);
