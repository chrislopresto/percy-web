export default function(snapshots) {
  let width = _maxWidthForSnapshots(snapshots);

  return snapshots.sort(function(a, b) {
    // Prioritize snapshots with diffs at any widths over snapshots with no diffs at any widths

    let maxDiffRatioA = _maxDiffRatioAnyWidth(a.get('comparisons'));
    let maxDiffRatioB = _maxDiffRatioAnyWidth(b.get('comparisons'));

    let aHasDiffs = maxDiffRatioA > 0;
    let bHasDiffs = maxDiffRatioB > 0;

    let aHasNoDiffs = maxDiffRatioA == 0;
    let bHasNoDiffs = maxDiffRatioB == 0;

    if (aHasDiffs && bHasNoDiffs) {
      return -1;
    } else if (bHasDiffs && aHasNoDiffs) {
      return 1;
    }

    // Next prioritize snapshots with comparisons at the current width
    let comparisonForA = _comparisonAtCurrentWidth(a, width);
    let comparisonForB = _comparisonAtCurrentWidth(b, width);

    let aHasNoComparisonAtWidth = !comparisonForA;
    let bHasNoComparisonAtWidth = !comparisonForB;

    if (comparisonForA && bHasNoComparisonAtWidth) {
      return -1;
    } else if (comparisonForB && aHasNoComparisonAtWidth) {
      return 1;
    } else if (comparisonForA && comparisonForB) {
      // Both snapshots have a comparison for the current width, sort by diff percentage.
      return comparisonForB.get('smartDiffRatio') - comparisonForA.get('smartDiffRatio');
    }

    // Finally, sort by diff ratio across all widths.
    // Sorts descending.
    return maxDiffRatioB + maxDiffRatioA;
  });
}

function _maxWidthForSnapshots(snapshots) {
  // TODO: put `maxComparisonWidth` on snapshot model after snapshots api work is done
  let maxWidth = snapshots.get('firstObject.comparisons.firstObject.width');
  snapshots.forEach(snapshot => {
    let comparisons = snapshot.get('comparisons');
    comparisons.forEach(comparison => {
      const tmpWidth = comparison.get('width');
      if (tmpWidth > maxWidth) {
        maxWidth = tmpWidth;
      }
    });
  });

  return maxWidth;
}

function _comparisonAtCurrentWidth(snapshot, width) {
  return snapshot.get('comparisons').findBy('width', width);
}

function _maxDiffRatioAnyWidth(comparisons) {
  let comparisonWidths = comparisons.mapBy('smartDiffRatio').filter(x => x);
  return Math.max(0, ...comparisonWidths); // Provide minimum of one param to avoid -Infinity
}
