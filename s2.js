import { s2 } from 's2js';
const { cellid, LatLng, Point, Cell, Cap, RegionCoverer } = s2;

/*
As the CivilDefense.io user pans and zooms the map, the app uses the S2 library to compute a set of non-overlapping
"cells" around the globe that covers the map area being displayed. The app then subscribes to events for each of
these cells. When something is published to any of the subscribed cells, the map gets an alert icon at that point.

The S2 library divides the globe into sets of non-overlapping cells, with each set being at a different zoom scale.
In order to minimize the number of different subscriptions needed to cover the area, we use the largest such scale for
the bulk of displayed area, and fill in the rest with smaller-scaled cells. Thus one person may have subscribed
to big cell around a given point, while another user has subscribed to smaller cell around that point.

When publishing, we need to publish to "all" the different sized cells that contain the given lat/lng.
(Actually, we only use the 18 largest sizes of s2, which otherwise goes down to a few millimeters.)
Therefore, we need to be able to compute a list of all the largest S2 identifiers that contain the point.

See https://s2geometry.io/
*/

const MAX_LEVEL = 30;
export function getContainingCells(lat, lng) {
  // Return a list of the S2 cell identifiers for the largest cells around the give lattiude/longitude.
  const userLatLng = LatLng.fromDegrees(lat, lng);
  const userPt = Point.fromLatLng(userLatLng);
  // Get leaf-level CellId (level 30)
  const userLocCellId = Cell.fromPoint(userPt).id;
  let cells = Array(MAX_LEVEL);
  for (let level = 0; level <= MAX_LEVEL; level++) {
    cells[level] = cellid.parent(userLocCellId, level);
  }
  return cells.slice(0, 17);
}
