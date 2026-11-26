const un = (id: string, w: number) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
const fl = (kw: string, w: number, lock: number) => `https://loremflickr.com/${w}/${Math.round(w * 0.65)}/${kw}?lock=${lock}`;

export const pic = (kw: string, lock: number, id = "", w = 900): string[] =>
  id ? [un(id, w), fl(kw, w, lock)] : [fl(kw, w, lock)];

export const IMG = {
  home: pic("road,mountain", 1, "1469854523086-cc02fe5d8800", 1800),
  svc: {
    local: pic("london,street", 21, "1529655683826-aba9b3e77383"),
    long: pic("highway,countryside", 22, "1506905925346-21bda4d32df4"),
    airport: pic("airport,airplane", 23, "1436491865332-7a61a109cc05"),
    hotel: pic("hotel,building", 24, "1566073771259-6a8506099945"),
    meet: pic("airport,terminal", 25),
    daily: pic("black,car", 26, "1542362567-b07e54358753"),
  } as Record<string, string[]>,
  cars: [pic("sedan,car", 31, "1494976388531-d1058494cdd8"), pic("minivan,car", 32, "1503376780353-7e6692767b70"), pic("suv,car", 33, "1533473359331-0135ef1b58bf"), pic("minibus,van", 34, "1549317661-bd32c8ce0db2")],
};


