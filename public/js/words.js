/* ================================================================
   SLOVNÍK A TEXTY
   WORDS  = běžná česká slova (malá písmena); z nich se generují cvičení
            jen z písmen, která už žák zná
   NAMES  = vlastní jména pro nácvik velkých písmen
   TEXTS  = souvislé odstavce pro závěrečné lekce a testy rychlosti
================================================================ */

const RAW_WORDS = `
a aj ale ani asi aby až už jak jaká jaké jaký kde kdo kdy kam tam sem tak tady
teď již ještě jen jenom jsem jsi je jsme jste jsou byl byla bylo byli být
sad sada sady dal dala dali dalo lak laky klas klasy sklad sklady slad salsa
kladl kladla jas jasu les lesk lesy led ledu lid lidi jed jedl jedla jedle
jedli sejf deska desky sedla sedl sedli fialka fialky lekl lekla lekli kalif
idea idey kila kilo ruka ruku kus kusy kusu sud sudy rada rady radu dar dary
drak draka kluk kluka krk kufr kufry sirka sirky fakir ruda kudla jiskra
jiskry rak raka rasa kraj kraje kreslil kreslila dusil dusila hlad hlas hlasy
hrad hrady hra hry duha duhy dluh dluhy sluha hledal hledala husa husy shluk
hrudka hrudky hraje kolo kola okolo doma dole oko oka dolar hora hory skok
skoro sokol osud hrdlo holka holky kolega rok roky role sklo sadlo kolej
koleje kosa losos hod hodil hodila okraj okraje odkud kolik doklad doklady
sloh jahoda jahody sedlo foukal foukala tak taky tady tisk tiskl tuze zase
zahrada rozhodl rozhodla zlato tlak trh ztratil ztratila kotel auto auta teta
stroj stroje sestra hotel hotely list listy trest struha uzel jezdit jezdil
jezero drozd dort dorty zrada zradil hrozil pole pila plot park pero patro
post pes prst prsty pastelka plat platit paprsek pokoj pokoje pozor potok
potoky porada porady opera lopata sport popis podpis stopa stopy sklep sklepy
lupa kapr plod plody sloup sloupy hrst
čas chvíle hodina hodiny minuta doba den dny týden měsíc rok léto zima jaro
podzim ráno večer noc dnes zítra včera teprve brzy pozdě často někdy nikdy
vždy znovu hned stále spolu sám sama samo proč protože nebo než pak potom
velmi hodně málo více méně také dům domov dveře okno stůl židle postel
kuchyň koupelna pokoj zahrada strom stromy louka pole cesta silnice ulice
město vesnice náměstí most řeka potok jezero moře hora kopec údolí skála
kámen písek voda oheň vzduch země nebe slunce hvězda mrak déšť sníh vítr
bouře mlha rosa tráva květ květina růže tulipán kořen větev jablko hruška
švestka třešně meloun citron pomeranč banán mrkev brambor cibule česnek
okurka rajče zelí paprika chléb rohlík máslo sýr mléko vejce maso ryba
polévka oběd večeře snídaně svačina káva čaj džus pivo víno cukr sůl pepř
med koláč dort sušenka člověk lidé muž žena dítě děti chlapec dívka holka
otec matka táta máma syn dcera bratr sestra dědeček babička strýc teta
rodina přítel kamarád soused učitel žák student lékař doktor řidič kuchař
prodavač zedník hasič policista pilot herec malíř spisovatel básník pes
kočka kůň kráva prase ovce koza slepice kohout kachna husa myš zajíc liška
vlk medvěd jelen srna ježek veverka pták sova orel vrabec čáp žába had
želva motýl včela moucha mravenec pavouk brouk hlava vlasy oči ucho uši nos
ústa zub zuby jazyk rameno ruce prsty noha nohy koleno záda břicho srdce
kůže kost kniha knihy sešit tužka papír stránka dopis obálka taška batoh
klíč zámek telefon počítač klávesnice klávesa obrazovka tiskárna lampa
světlo skříň police koberec obraz zrcadlo hrnek talíř lžíce vidlička nůž
hrnec pánev láhev sklenice auto vlak autobus tramvaj kolo loď letadlo metro
nádraží zastávka letiště jízdenka škola třída lekce úkol úkoly známka práce
firma kancelář porada schůzka projekt plán cíl úspěch chyba chyby otázka
odpověď slovo slova věta věty text texty řádek písmeno číslo znak prst
rychlost přesnost cvičení život svět příroda pravda láska radost smutek
strach naděje klid mír zdraví nemoc síla moc myšlenka nápad sen paměť
zkušenost znalost dovednost zvyk vůle trpělivost dobrý dobrá dobré špatný
velký velká malý malá nový nová staré starý stará mladý dlouhý krátký
vysoký nízký široký úzký rychlý pomalý těžký lehký snadný jednoduchý složitý
teplý studený horký chladný suchý mokrý čistý krásný hezký veselý smutný
klidný tichý hlasitý silný slabý chytrý pilný líný šťastný zdravý nemocný
bílý černý červený modrý zelený žlutý hnědý šedý tmavý světlý první druhý
třetí poslední celý každý jiný stejný další český česká mít mám má máme
dělat dělám psát píšu píše píšeme číst čtu čte mluvit říkat říct vidět
slyšet chtít chci můžu může musí jít jdu jde jdeme chodit běžet běhat jet
jedu jezdit letět plavat skákat sedět stát ležet spát vstávat jíst jím pít
piju vařit péct kupovat koupit platit prodávat dát dávat brát vzít nést
nosit hledat najít ztratit otevřít zavřít začít skončit učit naučit
pracovat odpočívat hrát zpívat tančit kreslit malovat počítat myslet vědět
znát pamatovat zapomenout rozumět ptát odpovídat čekat zkusit zkoušet
opakovat trénovat cvičit zlepšit pomáhat pomoct milovat smát plakat bydlet
žít rychle pomalu dobře špatně hezky správně přesně klidně tiše hlasitě
rovně doma venku nahoře dole vpravo vlevo vpředu vzadu blízko daleko
úterý úsměv účet úroveň úspěšný údaj úhel úroda úvod úplně ústav
teď loď zeď měď ať chuť síť kůň dlaň píseň daň laň tůň báseň ďábel ťukat
ťuká dědeček kotník koník
móda gól góly tón tóny óda fórum kód kódy próza sólo póza
web weby wifi watt kiwi show whisky aquapark squash kvíz taxi xylofon text
mix box relax fax saxofon luxus maximum extra existence praxe export
banka bota boty barva barvy bolest budova byt byty cena ceny cíl dárek
dárky dům ples film filmy hudba hřiště hrnek jídlo kino klobouk koruna
kuře lavice les lev lodě obchod obchody okno park parky pohádka pokladna
poklad pondělí pátek sobota neděle středa čtvrtek ráj sál sklep slon
sloní stan stany tabule tanec tričko vánoce zápas zpráva zprávy zvíře
zvířata zámek žehlička adresa banka bunda cukrárna dálnice divadlo energie
garáž helma internet jazyky kapsa karta kufr lampa lékárna malina mapa
nákup nebe obchod ovoce peníze pošta recept sešit stanice taška tempo
tón úsměv vesnice výlet zelenina zmrzlina
`;

const RAW_WORDS_2 = `
gala halda dlaha fajfka laskal laskala skal hala haly kafe jehla jehly hejkal
lilek flek dekl kel sklidil sklidila hesla sedadla sedadlo kdesi jeli jela
jeden jedna jedno jedni lesk lesku lekce dle sejde sejdu rajka krajka lusk
lusky suk frak kufru druh druhu kruh kruhy hraje hrajeme hrají sraz srazu
dar daru dala dali jedla sedla sedli hledal hledali hledala lekli fialka
fialky jahoda jahody kladivo kladiva dlouho dole dolů sklo skla
hrad hradu hradě hory hor horu hora kolo kola kolu holub holubi
dub duby dubu ruka rukou ruce rukama noha nohou nohama hlava hlavy hlavou
oko okem oči očima ucho uchem uši ušima nos nosu nosem ústa zub zuby zubů
rok roku roky let léta den dne dni dny týden týdne týdny měsíc měsíce
hodina hodiny hodinu hodin minuta minuty minut sekunda sekundy chvíle chvíli
ráno ránu dopoledne poledne odpoledne večer večera noc noci půlnoc
pondělí úterý středa čtvrtek pátek sobota neděle víkend víkendu svátek
leden únor březen duben květen červen červenec srpen září říjen listopad prosinec
jaro jara léto léta podzim podzimu zima zimy zimu počasí teplo zima vedro
slunce sluncem měsíc hvězdy obloha mraky déšť deště sníh sněhu led ledu
vítr větru bouřka blesk hrom duha mlha rosa kroupy mráz mrazu
strom stromu stromy les lesa lesy lesem louka louky pole polí zahrada zahrady
tráva trávu květ květy list listy větev větve kořen kořeny keř keře
jablko jablka hruška hrušky švestka švestky třešeň višně malina maliny
jahoda borůvka borůvky ořech ořechy houba houby kaštan kaštany žalud
rajče rajčata okurka okurky mrkev cibule česnek brambory zelí salát
paprika dýně hrách fazole kukuřice čočka rýže těstoviny knedlík knedlíky
chléb chleba rohlík rohlíky houska housky koláč koláče buchta buchty
máslo sýr sýry tvaroh jogurt mléko smetana vejce vajíčko šunka salám
maso ryba ryby kuře polévka omáčka guláš řízek oběd obědy večeře snídaně
káva kávu čaj čaje voda vody vodu džus limonáda pivo víno sirup med cukr
sůl pepř mouka olej ocet hořčice kečup čokoláda bonbon bonbony zmrzlina
dům domu domy domě byt bytu pokoj pokoje kuchyně ložnice koupelna chodba
okno okna dveře zeď zdi strop podlaha schody střecha komín sklep půda
stůl stolu stoly židle křeslo gauč postel skříň police lampa koberec
hrnek hrnky talíř talíře miska lžíce lžička vidlička nůž hrnec pánev
kniha knihy knihu sešit sešity tužka tužky pero pera pravítko guma papír
taška batoh kufr peněženka klíč klíče brýle hodinky deštník šála čepice
bunda kabát svetr tričko košile kalhoty sukně šaty boty ponožky rukavice
auto auta autem vlak vlaky vlakem autobus tramvaj metro kolo loď letadlo
silnice ulice cesta cesty most mosty náměstí park parky nádraží stanice
město města městě vesnice vesnici obec kraj kraje země státu stát
škola školy škole třída třídy učebna lavice tabule křída zvonek přestávka
učitel učitelka žák žáci žákyně student studenti ředitel ředitelka
úkol úkoly úkolů test testy písemka známka známky vysvědčení prázdniny
práce práci prací firma firmy kancelář šéf kolega kolegyně porada plat
lékař lékařka sestra nemocnice lékárna lék léky nemoc horečka kašel rýma
pes psa psi psem kočka kočky kočku kůň koně kráva krávy prase prasata
ovce koza kozy slepice kohout kachna husa králík myš myši potkan
liška lišky vlk vlci medvěd jelen srna zajíc ježek veverka bobr vydra
pták ptáci sova orel čáp vrána straka holub sýkorka vrabec kos labuť
ryba kapr štika pstruh žába had ještěrka želva šnek motýl včela vosa
čmelák moucha komár mravenec pavouk brouk beruška červ
máma táta maminka tatínek rodiče babička dědeček děda bába vnuk vnučka
bratr sestra syn dcera strýc teta bratranec sestřenice rodina rodiny
kamarád kamarádka kamarádi přítel přítelkyně soused sousedka host hosté
člověk lidé muž muži žena ženy dítě děti chlapec chlapci dívka dívky
dobrý dobrá dobré dobří velký velká velké malý malá malé nový nová nové
starý stará staré mladý mladá mladé hezký hezká hezké krásný krásná krásné
rychlý rychlá rychlé pomalý pomalá pomalé dlouhý dlouhá dlouhé krátký krátká
vysoký vysoká nízký nízká široký široká úzký úzká těžký těžká lehký lehká
teplý teplá studený studená horký horká suchý suchá mokrý mokrá čistý čistá
tichý tichá hlasitý veselý veselá smutný smutná šťastný šťastná zdravý
silný silná slabý slabá chytrý chytrá hodný hodná zlý zlá líný pilný pilná
bílý bílá černý černá červený červená modrý modrá zelený zelená žlutý žlutá
hnědý hnědá šedý šedá růžový fialový oranžový zlatý stříbrný barevný
první druhý třetí čtvrtý pátý šestý sedmý osmý devátý desátý poslední
jeden jedna dva dvě tři čtyři pět šest sedm osm devět deset jedenáct
dvanáct dvacet třicet čtyřicet padesát sto tisíc milion
být jsem jsi je jsme jste jsou byl byla bylo byli budu bude budeme budou
mít mám máš má máme máte mají měl měla měli
dělat dělám děláš dělá děláme dělají dělal dělala udělat
psát píšu píšeš píše píšeme píšete píšou psal psala napsat napsal
číst čtu čteš čte čteme čtou četl četla přečíst přečetl
jít jdu jdeš jde jdeme jdou šel šla šli přijít přišel přišla odejít
jet jedu jede jedeme jedou jel jela jeli přijet odjet
mluvit mluvím mluví mluvíme říct řekl řekla říkat říká říkají
vidět vidím vidí viděl viděla slyšet slyším slyší slyšel
chtít chci chceš chce chceme chtějí chtěl chtěla
moci můžu můžeš může můžeme mohou mohl mohla
muset musím musíš musí musíme musel musela
vědět vím víš ví víme vědí věděl znát znám zná znají znal
učit učím učí učíme učil učila naučit naučil naučila učit se
pracovat pracuji pracuje pracujeme pracoval pracovala
hrát hraju hraje hrajeme hrál hrála zahrát zpívat zpívá zpíval
tančit tančí kreslit kreslí kreslil malovat maluje maloval
jíst jím jíš jí jíme jedí jedl pít piju pije pijeme pil pila
spát spím spí spal spala vstávat vstává vstal vstala
sedět sedím sedí seděl ležet leží ležel stát stojí stál stála
běžet běží běžel běhat běhá plavat plave plaval skákat skáče
čekat čekám čeká čekal čekala hledat hledám hledá najít našel našla
dát dám dá dal dávat dává brát beru bere bral vzít vzal vzala
nést nese nesl nosit nosí nosil koupit koupil koupila platit platí
otevřít otevřel zavřít zavřel začít začal začala skončit skončil
myslet myslím myslí myslel rozumět rozumím rozumí pamatovat zapomenout
ptát ptám ptá ptal odpovědět odpověděl odpovídá zkusit zkusil zkouší
opakovat opakuje opakoval trénovat trénuje cvičit cvičí cvičil
pomoct pomohl pomáhat pomáhá bydlet bydlí bydlel žít žije žil
milovat miluje miloval smát směje smál plakat pláče plakal
vařit vaří vařil péct peče pekl uklízet uklízí umýt myje
rychle pomalu dobře špatně hezky krásně správně přesně klidně tiše
hlasitě rovně doma venku uvnitř nahoře dole vpravo vlevo vpředu vzadu
blízko daleko brzy pozdě dnes zítra včera teď hned potom pak nyní
často někdy nikdy vždy znovu zase ještě už jen také taky spolu
sám sama samo všichni všechno nic něco někdo nikdo kdokoli cokoli
tady tam sem odtud odsud kde kam kudy proč jak kdy kolik který která
ano ne možná asi určitě jistě skoro téměř velmi moc trochu málo hodně
slovo slova slov věta věty vět text texty řádek řádky písmeno písmena
klávesa klávesy klávesnice prst prsty prstů ruka ruce rychlost přesnost
chyba chyby chyb úhoz úhozy cvičení lekce lekci úloha úlohy cíl cíle
hra hry hru hráč hráči míč míče branka gól zápas hřiště trenér tým
hudba písnička píseň kytara klavír housle buben zpěvák koncert
film filmy kino divadlo herec herečka obraz malíř kniha básník příběh
pohádka pohádky princ princezna král královna drak čert vodník víla
radost smutek strach vztek láska přátelství pravda lež štěstí naděje
nápad nápady otázka otázky odpověď odpovědi problém řešení důvod
telefon mobil počítač tablet obrazovka myš tiskárna internet zpráva email
peníze koruna koruny cena ceny obchod obchody nákup tržnice pokladna
dárek dárky přání narozeniny vánoce velikonoce oslava dort svíčka
moře pláž písek vlna vlny ostrov loďka jezero rybník řeka potok pramen
hora hory kopec kopce skála skály údolí jeskyně cesta túra výlet stan
`;

export const WORDS = [...new Set([...RAW_WORDS.trim().split(/\s+/), ...RAW_WORDS_2.trim().split(/\s+/)])];

export const NAMES = [
  "Praha", "Brno", "Ostrava", "Plzeň", "Olomouc", "Liberec", "Zlín", "Jihlava",
  "Kladno", "Opava", "Tábor", "Písek", "Kolín", "Cheb", "Šumava", "Krkonoše",
  "Morava", "Vltava", "Labe", "Česko", "Čechy", "Jana", "Petr", "Eva", "Pavel",
  "Marie", "Tomáš", "Lucie", "Jakub", "Anna", "Martin", "Tereza", "Jan", "Karel",
  "Ema", "Adam", "Šárka", "Štěpán", "Řehoř", "Žofie", "Čeněk", "Ondřej",
  "Zdeněk", "Jiří", "Hana", "Věra", "Ivana", "Ústí", "Říp", "Žatec", "Ďáblice",
  "Ťapka", "Ňuňa", "Éva", "Óbuda", "Áron", "Ula", "Quido",
  "Xenie", "Yvona", "Walter", "Viktor", "Gabriela", "Filip", "Dana", "Bohdan",
];

export const TEXTS = [
  "Psaní všemi deseti není kouzlo, ale dovednost, kterou se může naučit každý. Stačí pravidelně cvičit a nespěchat. Prsty si postupně zapamatují, kde která klávesa leží, a hlava se může věnovat tomu, co chcete napsat.",
  "Ráno bylo chladno a nad řekou se válela hustá mlha. Rybář seděl na břehu, v ruce držel prut a díval se, jak se hladina pomalu leskne v prvních paprscích slunce. Kolem proletěla volavka a zmizela mezi stromy.",
  "Když se učíte psát na klávesnici, nedívejte se na ruce. Zpočátku budete pomalí a uděláte spoustu chyb, ale to je v pořádku. Přesnost je důležitější než rychlost. Rychlost přijde sama, jakmile si prsty zvyknou na správné pohyby.",
  "Babička upekla švestkový koláč a celý dům voněl skořicí. Děti se seběhly do kuchyně, sedly si ke stolu a netrpělivě čekaly, až koláč trochu vychladne. Dědeček mezitím uvařil čaj a nalil ho do velkých hrnků.",
  "V Praze žije více než milion lidí. Každý den se po městě přepravují tramvajemi, autobusy a metrem. První úsek metra byl otevřen v roce 1974 a dnes má síť tři linky a desítky stanic.",
  "Hory jsou krásné v každém ročním období. V zimě je pokrývá sníh a lidé na nich lyžují, v létě se po nich chodí na dlouhé túry. Kdo vyleze až na vrchol, dočká se nádherného výhledu do kraje.",
  "Počítač je dnes běžnou součástí práce i zábavy. Píšeme na něm dopisy, zprávy, úkoly do školy i dlouhé texty. Kdo umí psát rychle a bez chyb, ušetří každý den spoustu času a méně se unaví.",
  "Na zahradě rostou jabloně, hrušně a třešně. Na jaře kvetou bíle a růžově, v létě dávají stín a na podzim plody. Sousedé si chodí pro jablka a na oplátku nosí domácí med, vejce nebo zeleninu.",
  "Je důležité dělat si přestávky. Po každých dvaceti až třiceti minutách psaní se protáhněte, uvolněte ramena a zavřete na chvíli oči. Zápěstí mějte rovně a prsty lehce pokrčené nad domovskou řadou.",
  "Vlak přijel na nádraží s desetiminutovým zpožděním. Cestující vystoupili na nástupiště, někteří spěchali na autobus, jiní se rozhlíželi, kudy vede cesta do centra. Na tabuli svítil čas 17:45 a nápis: Pozor, vlak odjíždí!",
  "Kolik stojí jeden rohlík? Před několika lety to bylo kolem dvou korun, dnes je to často víc. Ceny potravin se mění (někdy rychle, jindy pomalu) a lidé je pozorně sledují - hlavně v obchodech s vlastní pekárnou.",
  "Ťuk, ťuk, ozvalo se ode dveří. Teď, nebo nikdy, řekl si Zdeněk a otevřel. Venku stál soused s košíkem hub a ptal se, jestli nechceme ochutnat smaženici. Takové věty jsou skvělé pro trénink, protože obsahují písmena ď, ť a ň.",
  "Ve škole se letos učí třicet dva žáků. Paní učitelka jim zadala úkol: napsat krátký příběh o zvířeti, které mají rádi. Nejlepší práce vyhrála malou cenu a visí teď na nástěnce vedle mapy Evropy.",
  "Do obchodu přivezli nové zboží: 25 kusů židlí, 12 stolů a 8 skříní. Prodavač vše zapsal do počítače, zkontroloval ceny a připravil výlohu. Sleva 20 % platí až do konce měsíce, tak neváhejte!",
];
