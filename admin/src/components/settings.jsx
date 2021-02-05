import React from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import I18n from "@iobroker/adapter-react/i18n";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import SettingsList from "./settingslist";

/**
 * @type {() => Record<string, import("@material-ui/core/styles/withStyles").CreateCSSProperties>}
 */
const styles = () => ({
    root: {
        color: "red",
    },    
    input: {
        marginTop: 0,
        minWidth: 400,
    },
    button: {
        marginRight: 20,
    },
    card: {
        maxWidth: 345,
        textAlign: "center",
    },
    media: {
        height: 180,
    },
    column: {
        display: "inline-block",
        verticalAlign: "top",
        marginRight: 20,
    },
    columnLogo: {
        width: 350,
        marginRight: 0,
    },
    columnSettings: {
        width: "calc(100% - 370px)",
    },
    controlElement: {
        //background: "#d2d2d2",
        marginBottom: 5,
    },
});

/**
 * @typedef {object} SettingsProps
 * @property {Record<string, string>} classes
 * @property {Record<string, any>} native
 * @property {(attr: string, value: any) => void} onChange
 */

/**
 * @typedef {object} SettingsState
 * @property {undefined} [dummy] Delete this and add your own state properties here
 */

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    const divStyle = {
        overflowY: "scroll",
        height: "calc( 100% - 150px )",
    };
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={divStyle}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};const StyledTextField = withStyles({
    root: {
        color: "red",
    },
})(TextField);

/**
 * @extends {React.Component<SettingsProps, SettingsState>}
 */
class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.tab = 0;
        
        this.addHandler = this.addHandler.bind(this);
        this.onChangeTVCount = this.onChangeTVCount.bind(this);
    }
    a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            "aria-controls": `simple-tabpanel-${index}`,
        };
    }

    /**
     * @param {AdminWord} title
     * @param {string} attr
     * @param {string} type
     */
    renderInput(title, attr, type) {
        return (
            <StyledTextField
                label={I18n.t(title)}
                className={`${this.props.classes.input} ${this.props.classes.controlElement}`}
                value={this.props.native[attr]}
                type={type || "text"}
                onChange={(e) => this.props.onChange(attr, e.target.value)}
                margin="normal"
            />
        );
    }

    /**
     * @param {AdminWord} title
     * @param {string} attr
     * @param {{ value: string; title: AdminWord }[]} options
     * @param {React.CSSProperties} [style]
     */
    renderSelect(title, attr, options, style) {
        return (
            <FormControl
                className={`${this.props.classes.input} ${this.props.classes.controlElement}`}
                style={{
                    paddingTop: 5,
                    ...style
                }}
            >
                <Select
                    value={this.props.native[attr] || "_"}
                    onChange={(e) => this.props.onChange(attr, e.target.value === "_" ? "" : e.target.value)}
                    input={<Input name={attr} id={attr + "-helper"} />}
                >
                    {options.map((item) => (
                        <MenuItem key={"key-" + item.value} value={item.value || "_"}>
                            {I18n.t(item.title)}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{I18n.t(title)}</FormHelperText>
            </FormControl>
        );
    }

    /**
     * @param {string} AdminWord
     * @param {string} attr
     * @param {React.CSSProperties} [style]
     */
    renderCheckbox(title, attr, style) {
        return (
            <FormControlLabel
                key={attr}
                style={{
                    paddingTop: 5,
                    ...style
                }}
                className={this.props.classes.controlElement}
                control={
                    <Checkbox
                        checked={this.props.native[attr]}
                        onChange={() => this.props.onChange(attr, !this.props.native[attr])}
                        color="primary"
                    />
                }
                label={I18n.t(title)}
            />
        );
    }
    addHandler() {
        this.props.onChange("tvcount", this.props.native["tvcount"]+1);
    }
    onChangeTVCount(value) {
        this.props.onChange("tvcount", value);
    }

    render() {
        
        const value = this.state.tab;

        const handleChange = (event, newValue) => {
            this.setState({
                tab: newValue
            });
        };
        const StyledTabs = withStyles({
            scroller: {
                "background-color": "#2196f3",
            },
        })(Tabs);
        const StyledTab = withStyles({
            root: {
                //              "background-color": '#64b5f6',
            },
            selected: {
                color: "black",
                "background-color": "white",
            },
        })(Tab);
        
        return (
            <div>
                <AppBar position="static">
                    <StyledTabs value={value} onChange={handleChange.bind(this)} aria-label="simple tabs example">
                        <StyledTab label={I18n.t("TVprogram")} {...this.a11yProps(0)} />
                    </StyledTabs>
                </AppBar>
                <TabPanel value={value} index={0}>
                    <form className={this.props.classes.tab}>
                        <h3>{I18n.t("TVProgram configuration")}</h3>
                        <StyledTextField
                            label={I18n.t("TV count")}
                            className={`${this.props.classes.input} ${this.props.classes.controlElement}`}
                            value={this.props.native["tvcount"]}
                            type={"text"}
                            onChange={(e) => this.props.onChange("tvcount", e.target.value)}
                            margin="normal"
                            InputProps={{
                              readOnly: true,
                            }}
                        />
                        <Fab
                            onClick={this.addHandler}
                            size="medium"
                            color="primary"
                            aria-label="add">
                            <AddIcon />
                        </Fab>
                            <SettingsList 
                                context={this.props.context}
                                onChangeTVCount={this.onChangeTVCount}
                            />
                    </form>
                </TabPanel>
            </div>

        );
    }
}

export default withStyles(styles)(Settings);