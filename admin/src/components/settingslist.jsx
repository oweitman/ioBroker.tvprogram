import React from "react";
import { withStyles } from "@material-ui/core/styles";
import I18n from "@iobroker/adapter-react/i18n";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Fab from "@material-ui/core/Fab";
//import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import PropTypes from "prop-types";

/**
 * @type {(_theme: Theme) => import("@material-ui/styles").StyleRules}
 */
const styles = () => ({
    root: {
    },
    tablecell: {
        padding: "8px 8px",
    }
});

class SettingsList extends React.Component {
    constructor(props) {
        super(props);
        this.socket = props.context.socket;
        this.sendTo = props.context.socket.sendTo;
        this.instanceId = props.context.instanceId;
        this.delHandler = this.delHandler.bind(this);
        this.state={
            tvs:[]
        };
        this.getTVs();
    }
    getTVs() {
        let id = this.instanceId.split(".");
        id.shift();
        id.shift();
        id = id.join(".");
        this.socket.getObjectView(id,id+"\u9999","state").then( (objects) => {
            const tvs=[];
            for (const prop in objects) {
                if (prop.split(".")[3]==="config") tvs.push(prop.split(".")[2]);
            }
            this.setState({
                tvs:tvs.sort()
            });
            this.props.onChangeTVCount(tvs.length);
        });
    }
    delHandler(e,tv) {
        //		const a=0;
        let id = this.instanceId.split(".");
        id.shift();
        id.shift();
        id = id.join(".");
        this.socket.getObjectView(id,id+"\u9999","state").then( (objects) => {
            const deletes=[];
            for (const prop in objects) {
                if (prop.split(".")[2]===tv) {
                    deletes.push(this.socket.delObject(prop));
                }
            }
            Promise.all(deletes).then(() => {
                this.getTVs();
            });
        });
    }

    renderListItem(tv) {
        const { classes } = this.props;
        const StyledTableCellActions = withStyles({
            root: {
                "width": "1%",
                "whiteSpace": "nowrap",
                padding: "8px 8px",
            },
        })(TableCell);
        return (
            <TableRow key={tv}>
                <TableCell classes={{root:classes.tablecell}} >{tv}</TableCell>
                <StyledTableCellActions >
                    <Fab
                        onClick={(e) => this.delHandler(e,tv)}
                        size="small"
                        color="primary"
                        aria-label="add">
                        <DeleteIcon />
                    </Fab>
                </StyledTableCellActions>
            </TableRow>
        );
    }

    render() {
        const { classes } = this.props;
        const data = this.state.tvs || [];
        const StyledTableContainer = withStyles({
            root: {
                "width": "50%",
            },
        })(Table);

        return (
            <div>
                <h3>{I18n.t("Known TVs")}</h3>
                <StyledTableContainer component={Paper} style={{maxHeight: 200, overflow: "auto"}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell classes={{root:classes.tablecell}} ><b>{I18n.t("name")}</b></TableCell>
                                <TableCell classes={{root:classes.tablecell}}  ><b>{I18n.t("actions")}</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((tv) => {
                                return this.renderListItem(tv);
                            })}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </div>
        );

    }
}

SettingsList.propTypes = {
    onDel: PropTypes.func,
    onEdit1: PropTypes.func,
    onChangeTVCount: PropTypes.func,
    data: PropTypes.object,
    context: PropTypes.object,
    classes: PropTypes.object
};

export default withStyles(styles)(SettingsList);
