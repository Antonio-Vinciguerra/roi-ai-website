// Reuse the approved editorial photography, with deliberate framing for each
// page and a separate portrait focal point. These are not client/project images.
export const detailScenes = {
 operate:{image:'trade-port',width:1600,height:800,desktop:'60% 50%',mobile:'71% 50%',alt:'Container cranes and a working harbour in the early evening.'},
 grow:{image:'agritech-aerial',width:1600,height:900,desktop:'42% 50%',mobile:'38% 50%',alt:'Cultivated fields extending towards a sunlit horizon.'},
 invest:{image:'investment-table',width:1600,height:900,desktop:'60% 50%',mobile:'68% 50%',alt:'An architectural model and plans on a stone table.'},
 agritech:{image:'agritech-aerial',width:1600,height:900,desktop:'74% 50%',mobile:'86% 50%',alt:'A drone above vineyard rows and a rural landscape at sunrise.'},
 trade:{image:'trade-port',width:1600,height:800,desktop:'40% 50%',mobile:'32% 50%',alt:'A container ship moving through a harbour towards the open water.'},
 investing:{image:'investment-table',width:1600,height:900,desktop:'68% 50%',mobile:'78% 50%',alt:'A carefully detailed architectural model beside maps and plans.'},
 operations:{image:'trade-port',width:1600,height:800,desktop:'78% 50%',mobile:'94% 50%',alt:'Rows of containers and cranes across a large working port.'},
 commercial:{image:'investment-table',width:1600,height:900,desktop:'52% 50%',mobile:'56% 50%',alt:'Plans and a scale model laid out for a considered discussion.'}
};

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function detailHero(key,name,page,group) {
 const scene=detailScenes[key];
 return `<section class="detail-hero detail-immersive" style="--scene-desktop:${scene.desktop};--scene-mobile:${scene.mobile}" aria-labelledby="page-title" data-detail-hero>
 <div class="detail-backdrop" aria-hidden="true"><img src="assets/${scene.image}.webp" alt="" width="${scene.width}" height="${scene.height}" fetchpriority="high" decoding="async"></div>
 <a class="breadcrumb" href="index.html#${group}">← All ${group}</a>
 <div class="detail-heading"><p class="eyebrow">${group==='capabilities'?'Capability':'Sector'} / ${escape(name)}${key==='agritech'?' · First focus':''}</p><h1 id="page-title">${escape(page.title)}</h1><p class="lede">${escape(page.lede)}</p></div>
 <a class="detail-discover" href="#opportunity">Explore the opportunity <span aria-hidden="true">↓</span></a>
 </section>`;
}
