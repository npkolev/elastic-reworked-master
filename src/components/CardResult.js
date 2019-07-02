import React from 'react';
import ReactHtmlParser from "react-html-parser";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

// Element to display individual results returned by search action
const CardResult = ({ _source: { from, fromName, datasetName }, highlight }) => (
    <Card className="card demo card-margin">
        <CardContent>
            <Typography variant="h5" component="h2">
                {fromName}
            </Typography>
            <Typography className="typography-padding" color="textSecondary">
                {from}
            </Typography>
            <Typography className="typography-padding" component="p">{datasetName}</Typography>
            <Typography className="typography-padding" component="div">
                <Divider />
                {Object.keys(highlight).map(key => ( // Get the keys of the highlight object and use ReactHtmlParser for rendering the string-wrapped tag
                    <div key={key}>
                        <h3>{key}</h3>
                        <p>{ReactHtmlParser(highlight[key])}</p> 
                    </div>
                ))}
            </Typography>
        </CardContent>
    </Card>
);

export default CardResult;