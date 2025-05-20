
// Simple K-means clustering implementation
export interface DataPoint {
  x: number;
  y: number;
  [key: string]: any; // For additional attributes
}

export interface Cluster {
  centroid: { x: number; y: number };
  points: DataPoint[];
}

export function kMeansClustering(data: DataPoint[], k: number, maxIterations: number = 100): Cluster[] {
  if (data.length < k) {
    throw new Error("Not enough data points for the specified number of clusters");
  }

  // Initialize clusters with random centroids from the data
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  let clusters: Cluster[] = [];
  
  for (let i = 0; i < k; i++) {
    clusters.push({
      centroid: { x: shuffled[i].x, y: shuffled[i].y },
      points: []
    });
  }

  // Main k-means loop
  let iteration = 0;
  let changed = true;
  
  while (changed && iteration < maxIterations) {
    // Reset points in each cluster
    clusters.forEach(cluster => {
      cluster.points = [];
    });
    
    // Assign each point to the nearest centroid
    data.forEach(point => {
      let minDistance = Infinity;
      let closestClusterIndex = 0;
      
      clusters.forEach((cluster, index) => {
        const distance = Math.sqrt(
          Math.pow(point.x - cluster.centroid.x, 2) + 
          Math.pow(point.y - cluster.centroid.y, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestClusterIndex = index;
        }
      });
      
      clusters[closestClusterIndex].points.push(point);
    });
    
    // Recalculate centroids
    changed = false;
    clusters.forEach(cluster => {
      if (cluster.points.length === 0) return;
      
      const newCentroid = {
        x: cluster.points.reduce((sum, point) => sum + point.x, 0) / cluster.points.length,
        y: cluster.points.reduce((sum, point) => sum + point.y, 0) / cluster.points.length
      };
      
      // Check if the centroid changed significantly
      if (
        Math.abs(newCentroid.x - cluster.centroid.x) > 0.001 ||
        Math.abs(newCentroid.y - cluster.centroid.y) > 0.001
      ) {
        changed = true;
      }
      
      cluster.centroid = newCentroid;
    });
    
    iteration++;
  }
  
  return clusters;
}
