import React from 'react';

const GraphVisualizer = () => {
    return (
        <iframe
            src="https://neodash.graphapp.io/?neo4jConnectionURL=neo4j+s://neo4j:gOBxyw8Sp1_eEHcq_LpXYAVzFVb4Sfxj0M20S5Kpi3k@c247ea2f.databases.neo4j.io&database=neo4j&dashboard=Test"
            width="100%"
            height="1100"
            style={{ border: "none" }}
            title="NeoDash Test Dashboard"
        />
    );
};

export default GraphVisualizer;