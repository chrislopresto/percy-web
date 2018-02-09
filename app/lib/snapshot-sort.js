export default function(snapshots) {
  let width = _maxWidthForSnapshots(snapshots);

  function comparisonAtCurrentWidth(snapshot) {
    return snapshot.get('comparisons').findBy('width', width);
  }

  return snapshots.sort(function(a, b) {
    // Prioritize snapshots with diffs at any widths over snapshots with no diffs at any widths
    function maxDiffRatioAnyWidth(comparisons) {
      let comparisonWidths = comparisons.mapBy('smartDiffRatio').filter(x => x);
      return Math.max(0, ...comparisonWidths); // Provide minimum of one param to avoid -Infinity
    }

    let maxComparisonDiffA = maxDiffRatioAnyWidth(a.get('comparisons'));
    let maxComparisonDiffB = maxDiffRatioAnyWidth(b.get('comparisons'));
    if (maxComparisonDiffA > 0 && maxComparisonDiffB == 0) {
      // First snapshot has diffs, second doesn't at any widths
      return -1;
    } else if (maxComparisonDiffA == 0 && maxComparisonDiffB > 0) {
      // Second snapshot has diffs, first doesn't at any widths
      return 1;
    }

    // Next prioritize snapshots with comparisons at the current width
    let comparisonForA = comparisonAtCurrentWidth(a);
    let comparisonForB = comparisonAtCurrentWidth(b);
    if (comparisonForA && !comparisonForB) {
      // First snapshot has a comparison at the current width.
      return -1;
    } else if (!comparisonForA && comparisonForB) {
      // Second snapshot has a comparison at the current width.
      return 1;
    } else if (comparisonForA && comparisonForB) {
      // Both snapshots have a comparison for the current width, sort by diff percentage.
      return comparisonForB.get('smartDiffRatio') - comparisonForA.get('smartDiffRatio');
    }

    // Finally, sort by diff ratio across all widths.
    // Sorts descending.
    return maxComparisonDiffB + maxComparisonDiffA;
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
