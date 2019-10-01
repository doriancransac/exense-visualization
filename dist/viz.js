var productionmode = true;
var productionFile = 'viz.js';;
var devJSFolder = '/js/';
var devTemplateFolder = '/templates/';

var vizScripts = {};

var registerScript = function () {
    var scripts = document.getElementsByTagName("script");
    var scriptUrl = scripts[scripts.length - 1].src;

    var filenameSplit = scriptUrl.split("/");
    var filename = filenameSplit[filenameSplit.length - 1];

    vizScripts[filename] = scriptUrl;
};
registerScript();

var resolveTemplateURL = function (containername, componentname) {
    if (productionmode === false) {
        templateUrl = vizScripts[containername].replace(devJSFolder, devTemplateFolder)
            .replace(containername, componentname)
            + '?who=' + componentname
            + '&anticache=' + getUniqueId();
    } else {
        templateUrl = vizScripts[productionFile].replace(productionFile, 'templates/' + componentname);
    }
    return templateUrl;
}

var setIntervalDefault = 3000;

var runResponseProc = function (postProc, response) {
    return eval('(' + postProc + ')(response)');
};

var runRequestProc = function (postProc, requestFragment, workData) {
    return eval('(' + postProc + ')(requestFragment, workData)');
};

var runValueFunction = function (functionFragment, value) {
    return eval('(function(value){' + functionFragment + '})(value)');
};

var runDynamicEval = function (expression) {
    return eval(expression);
};

var evalDynamic = function (placeholders) {
    var returned = JSON.parse(JSON.stringify(placeholders));
    $.each(returned, function (index, placeholder) {
        if (placeholder.isDynamic) {
            placeholder.value = runDynamicEval(placeholder.value);
        }
    });
    return returned;
};

var resolve = function (obj, path) {
    path = path.split('.');
    var current = obj;
    while (path.length) {
        if (typeof current !== 'object') return undefined;
        current = current[path.shift()];
    }
    return current;
};

var getUniqueId = function () {
    return Math.random().toString(36).substr(2, 9);
}

var jsoncopy = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};
function Dashboard(widgets, title, state) {
    return {
        title: title,
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: state
    };
}

function Widget(bstwidth, dstate) {
    return {
        wstate: {
            widgetwidth: bstwidth,
        },
        state: dstate
    };
};

function DashletState(title, viewtoggle, tabindex, data, options, config, query){
    return {
        title: title,
        viewtoggle: viewtoggle,
        tabindex: tabindex,
        data: data,
        options: options,
        config: config,
        global: {},
        http: {},
        query: query
    };
}

function DashletData(transformed, state){
    return {
        transformed: transformed,
        state: state
    };
};

function Config(autorefresh, viewtoggle, master, slave, target) {
    return {
        autorefresh: autorefresh,
        master: master,
        slave: slave,
        target: target,
    };
}

function MgrState(gsettings, gautorefresh, gchevron, title) {
    return {
        globalsettings: gsettings,
        globalsettingsautorefresh: gautorefresh,
        globalsettingschevron: gchevron,
        globalsettingsname: title,
        gsautorefreshInterval: null
    }
}

function ChartOptions(chartHeight, chartWidth, chartType) {
    return {
        type: chartType,
        height: chartHeight,
        width: chartWidth,
        margin: {
            top: 20,
            right: 20,
            bottom: 50,
            left: 55
        },
        x: function (d) { return d.x; },
        y: function (d) { return d.y; },
        showLegend: false,
        scatter: {
            onlyCircles: false
        },
        forceY: 0,
        xAxis: {
            tickFormat: function (d) {
                //interpret these ranges as timestamp for now
                if ((d > 1000000000 && d < 2000000000) || (d > 1000000000000 && d < 2000000000000)) {
                    return d3.time.format("%H:%M:%S")(new Date(d));
                } else {
                    return d;
                }
            },
            rotateLabels: -30
        }
    };
}

function ContainerOptions(innerContainerHeight, innerContainerWidth) {
    return {
        height: innerContainerHeight,
        width: innerContainerWidth,
    };
};

function Options(chartOptions, containerOptions) {
    return {
        innercontainer: containerOptions,
        chart: chartOptions
    };
};

function Query(inputtype, type, method, controls) {
    return {
        inputtype: inputtype,
        type: type,
        datasource: {
            service: {
                method: method,
                controls: controls
            }
        }
    };
};;
function DefaultGlobalSettings() {
    return [{ "key": "__eId__", "value": ".*", "isDynamic": false }];
};

function DefaultMgrState() {
    return new MgrState(new DefaultGlobalSettings(), false, false, "Global Settings");
};

function DefaultDashboard(widgets) {
    return {
        title: 'New dashboard',
        widgets: new IdIndexArray(widgets, function (oid) {
            console.log('[widgets] ' + oid + '--default removal--');
        }),
        mgrstate: new DefaultMgrState()
    };
};

function DefaultConfig() {
    return new Config('Off', true, true, false, 'state.data.transformed');
};

function DefaultQuery() {
    return new Query("Raw", "Simple", "Get", {});
};

function DefaultChartOptions(chartHeight, chartWidth) {
    return new ChartOptions(chartHeight, chartWidth, "lineChart");
};

function DefaultDashletData(){
    return new DashletData([], {})
};

function DefaultDashletState(chartHeight, chartWidth, containerHeight, containerWidth){
    return new DashletState(
    'new', true, 0,
    new DefaultDashletData(),
    new Options(
        new DefaultChartOptions(chartHeight, chartWidth),
        new ContainerOptions(containerHeight, containerWidth)
    ),
    new DefaultConfig(),
    new DefaultQuery());
};

function DefaultWidget(chartHeight, chartWidth, containerHeight, containerWidth) {
    return new Widget(
        'col-md-6',
        new DefaultDashletState(chartHeight, chartWidth, containerHeight, containerWidth)
    );  
};

;
registerScript();

angular.module('rtm-controls', [])

    .directive('rtmControls', function () {
        return {
            restrict: 'E',
            scope: {
                state: '='
            },

            templateUrl: resolveTemplateURL('rtm-controls.js', 'rtm-controls.html'),
            controller: function ($scope, $rootScope) {
                $rootScope.queryResult = { 'abc': 'def' };
            }
        };
    })
;
registerScript();

angular.module('viz-dashlet', ['viz-query', 'dashletcomssrv'])
    .directive('vizDashlet', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                widgetid: '=',
                state: '=',
                displaymode: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-dashlet.js', 'viz-dashlet.html'),
            controller: function ($scope, $element, $http, dashletcomssrv) {

                console.log($scope.state.viewtoggle);

                $scope.selectTab = function (tabIndex) {
                    $scope.state.tabindex = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.state.tabindex;
                };

                $scope.toggleBarchevronToConf = function () {
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                $scope.toggleBarchevronToViz = function () {
                    //Not firing our own query if slave, just listening to data
                    //Also not firing if autorefresh is on
                    if (!$scope.state.config.slave && ($scope.state.config.autorefresh !== 'On')) {
                        $scope.fireQuery();
                    }
                    $scope.state.viewtoggle = !$scope.state.viewtoggle;
                }

                // Query firing
                $scope.isOngoingQuery = false;
                $scope.autorefreshInterval = undefined;

                $scope.fireQuery = function () {
                    try {
                        $scope.isOngoingQuery = true;
                        var srv = $scope.state.query.datasource.service;
                        if (!srv.params) {
                            srv.params = ""; // prevent "undefined" string from being concatenated
                        }
                        $scope.state.http.servicesent = 'url :' + JSON.stringify(srv.url + srv.params) + '; payload:' + JSON.stringify(srv.data);
                        $scope.executeHttp(srv.method, srv.url + srv.params, srv.data, $scope.dispatchSuccessResponse, srv, $scope.dispatchErrorResponse);
                    } catch (e) {
                        console.log('exception thrown while firing query: ' + e);
                    }
                };

                $scope.dispatchErrorResponse = function (response) {
                    console.log('error:' + JSON.stringify(response));
                    $scope.clearAsync();
                    $scope.isOngoingQuery = false;
                };

                $scope.executeHttp = function (method, url, payload, successcallback, successTarget, errorcallback) {
                    if (method === 'Get') { $http.get(url).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                    if (method === 'Post') { $http.post(url, payload).then(function (response) { successcallback(response, successTarget); }, function (response) { errorcallback(response); }); }
                };

                $scope.dispatchSuccessResponse = function (response, successTarget) {
                    try {
                        if ($scope.state.query.type === 'Simple') {
                            $scope.loadData(response, successTarget)
                        }
                        if ($scope.state.query.type === 'Async') {
                            var scallback = $scope.state.query.datasource.callback;
                            //$scope.state.data.serviceraw = response;
                            $scope.state.http.rawserviceresponse = JSON.stringify(response);
                            if ($scope.state.query.datasource.service.postproc.save) {
                                $scope.state.data.state = runResponseProc($scope.state.query.datasource.service.postproc.save.function, response);
                            }
                            var datatosend = scallback.data;
                            var urltosend = scallback.url;
                            if (scallback.preproc.replace) {
                                if (scallback.preproc.replace.target === 'data') {
                                    datatosend = JSON.parse(runRequestProc(scallback.preproc.replace.function, datatosend, $scope.state.data.state));
                                } else {
                                    if (scallback.preproc.replace.target === 'url') {
                                        urltosend = JSON.parse(runRequestProc(scallback.preproc.replace.function, urltosend, $scope.state.data.state));
                                    }
                                }
                            }

                            $scope.state.http.callbacksent = 'url :' + JSON.stringify(urltosend) + '; payload:' + JSON.stringify(datatosend);
                            var executionFunction = function () {
                                $scope.executeHttp(scallback.method, urltosend, datatosend, $scope.loadData, scallback, $scope.dispatchErrorResponse)
                            };
                            $scope.asyncInterval = setInterval(executionFunction, 500);
                        }
                    } catch (e) {
                        console.log(e);
                        $scope.clearAsync();
                        $scope.isOngoingQuery = false;
                    }
                };

                $scope.clearAsync = function () {
                    if ($scope.asyncInterval) {
                        clearInterval($scope.asyncInterval);
                    }
                };

                $scope.loadData = function (response, proctarget) {
                    if ($scope.state.query.type === 'Simple') {
                        $scope.state.http.rawserviceresponse = response;
                    }
                    if ($scope.state.query.type === 'Async') {
                        if ($scope.asyncInterval) {
                            try {
                                // stream consumed
                                if (runResponseProc($scope.state.query.datasource.callback.postproc.asyncEnd.function, response)) {
                                    $scope.clearAsync();
                                }
                            } catch (e) {
                                console.log(e);
                                $scope.clearAsync();
                            }
                        }
                        $scope.state.http.rawcallbackresponse = response;
                    }
                    $scope.state.data.rawresponse = { dashdata : response };
                };

                $scope.$watch('state.data.rawresponse', function (newValue) {
                    var proctarget = undefined;
                    if ($scope.state.query.type === 'Simple') {
                        proctarget = $scope.state.query.datasource.service;
                    }
                    if ($scope.state.query.type === 'Async') {
                        proctarget = $scope.state.query.datasource.callback;
                    }
                    if (proctarget && proctarget.postproc && newValue) { // due to watch init
                        $scope.state.data.transformed = { dashdata : runResponseProc(proctarget.postproc.transform.function, newValue.dashdata) };
                    }
                    $scope.isOngoingQuery = false;
                });

                $scope.$watch('state.config.autorefresh', function (newValue) {
                    if (newValue === 'On') {
                        $scope.autorefreshInterval = setInterval(function () {
                            if (!$scope.isOngoingQuery) {
                                try {
                                    $scope.fireQuery();
                                } catch (e) {
                                    console.log('[Autorefresh interval] unable to refresh due to error: ' + e);
                                    // agressive
                                    $scope.isOngoingQuery = false;
                                }
                            }
                        }, setIntervalDefault);
                    } else {
                        if ($scope.autorefreshInterval) {
                            clearInterval($scope.autorefreshInterval);
                        }
                    }
                });

                // Paging

                // also initPaging() on viewtoggle (back to config)?
                $scope.$on('templateph-loaded', function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        $scope.initPaging();
                    }
                });

                $scope.$on('firenext', function () {
                    $scope.nextPaging();
                });

                $scope.$on('fireprevious', function () {
                    $scope.previousPaging();
                });

                $scope.$on('template-updated', function () {
                    $scope.fireQuery();
                });

                $scope.initPaging = function () {
                    var paged = $scope.state.query.paged;
                    if (paged && paged.offsets && paged.offsets.first) {
                        paged.offsets.first.state = runValueFunction(paged.offsets.first.start);
                        if (paged.offsets.second) {
                            paged.offsets.second.state = runValueFunction(paged.offsets.second.start);
                        }
                    }
                    $scope.$broadcast('update-template-nofire');
                }

                $scope.nextPaging = function () {
                    var paged = $scope.state.query.paged;
                    paged.offsets.first.state = runValueFunction(paged.offsets.first.next, paged.offsets.first.state);
                    paged.offsets.second.state = runValueFunction(paged.offsets.second.next, paged.offsets.second.state);
                    $scope.$broadcast('update-template');
                }

                $scope.previousPaging = function () {
                    var paged = $scope.state.query.paged;
                    paged.offsets.first.state = runValueFunction(paged.offsets.first.previous, paged.offsets.first.state);
                    paged.offsets.second.state = runValueFunction(paged.offsets.second.previous, paged.offsets.second.state);
                    $scope.$broadcast('update-template');
                }
            }
        };
    });;
registerScript();

angular.module('viz-mgd-widget', ['viz-dashlet'])

    .directive('vizMgdWidget', function () {
        return {
            restrict: 'E',
            scope: {
                displaymode: '=',
                widgetid: '=',
                wstate: '=',
                state: '=',
                headersheight: '=',
                charttocontainer: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-mgd-widget.js', 'viz-mgd-widget.html'),
            controller: function ($scope, $element) {

                $scope.currentstate = JSON.parse(JSON.stringify($scope.state));
                $scope.state.chevron = true;
                $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                $scope.state.options.innercontainer.offset = 50;
                $scope.dashlettitle = $scope.state.title;

                $scope.toggleChevron = function () {
                    if ($scope.state.chevron) {
                        $scope.collapse();
                    } else {
                        $scope.restore();
                    }
                    $scope.state.chevron = !$scope.state.chevron;
                };

                $scope.collapse = function () {
                    $scope.state.savedHeight = $scope.state.options.innercontainer.height;
                    $scope.state.savedOffset = $scope.state.options.innercontainer.offset;
                    $scope.state.options.innercontainer.height = 30;
                    $scope.state.options.innercontainer.offset = 0;
                };

                $scope.restore = function () {
                    $scope.state.options.innercontainer.height = $scope.state.savedHeight;
                    $scope.state.options.innercontainer.offset = $scope.state.savedOffset;
                };

                $scope.$on('dashlettitle-change', function (event, arg) {
                    $scope.dashlettitle = arg.newValue;
                });

                $scope.getActualDashletWidth = function () {
                    return $element[0].children[0].children[0].offsetWidth;
                }

                $scope.updateSize = function (newWidth) {

                    //should only be done once at manager level
                    $scope.computeHeights();
                    var options = $scope.state.options;
                    options.chart.width = newWidth;
                    options.innercontainer.width = newWidth - 50;

                    if ($scope.wstate.widgetwidth === 'col-md-6') {
                        options.chart.height = $scope.chartHeightSmall;
                        options.innercontainer.height = $scope.innerContainerHeightSmall;
                    }
                    else {
                        options.chart.height = $scope.chartHeightBig;
                        options.innercontainer.height = $scope.innerContainerHeightBig;
                    }
                    $scope.forceRedraw();
                };

                $scope.forceRedraw = function () {
                    //force new angular digest
                    $scope.$apply(function () {
                        self.value = 0;
                    });
                };

                $scope.computeHeights = function () {
                    var sHeight = window.innerHeight;

                    $scope.chartHeightSmall = (sHeight - $scope.headersheight) / 2 - $scope.charttocontainer;
                    $scope.chartHeightBig = sHeight - ($scope.headersheight - 80) - $scope.charttocontainer;
                    $scope.chartWidthSmall = 0;
                    $scope.chartWidthBig = 0;
                    $scope.innerContainerHeightSmall = (sHeight - $scope.headersheight) / 2;
                    $scope.innerContainerHeightBig = sHeight - ($scope.headersheight - 80);
                    $scope.innerContainerWidthSmall = 0;
                    $scope.innerContainerWidthBig = 0;
                };

                $scope.computeHeights();

                $scope.$on('resize-widget', function () {
                    $scope.resize();
                });

                $scope.resize = function () {
                    $(document).ready(function () {
                        $scope.updateSize(0.8 * $scope.getActualDashletWidth());
                    });
                };

                $scope.extend = function () {
                    $scope.wstate.widgetwidth = 'col-md-12';
                    var options = $scope.state.options;
                    options.chart.height = $scope.chartHeightBig;
                    options.chart.width = $scope.chartWidthBig;
                    options.innercontainer.height = $scope.innerContainerHeightBig;
                    options.innercontainer.width = $scope.innerContainerWidthBig;

                    // still need to wait for document ready?!
                    $(document).ready(function () {
                        $scope.resize();
                    });
                };

                $scope.reduce = function () {
                    $scope.wstate.widgetwidth = 'col-md-6';
                    var options = $scope.state.options;
                    options.chart.height = $scope.chartHeightSmall;
                    options.chart.width = $scope.chartWidthSmall;
                    options.innercontainer.height = $scope.innerContainerHeightSmall;
                    options.innercontainer.width = $scope.innerContainerWidthSmall;

                    // still need to wait for document ready?!
                    $(document).ready(function () {
                        $scope.resize();
                    });
                };

                $scope.removeWidget = function () {
                    $scope.$emit('mgdwidget-remove', { wid: $scope.widgetid });
                }

                $(document).ready(function () {
                    $scope.resize();
                });
            }
        };
    });;
registerScript();
angular.module('viz-query', ['nvd3', 'ui.bootstrap', 'key-val-collection', 'rtm-controls'])
    .directive('vizQuery', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-query.html'),
            controller: function ($scope) {
            }
        }
    })
    .directive('vizView', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-view.html'),
            controller: function ($scope) {
                $scope.$watch('state.data.transformed', function (newvalue) {
                    if (newvalue && newvalue.dashdata) {
                        if ($scope.state.options.chart.type === 'table') {
                            $scope.tableData = $scope.toTable(newvalue.dashdata);
                        }
                        if ($scope.state.options.chart.type.endsWith('Chart')) {
                            $scope.chartData = $scope.toChart(newvalue.dashdata);
                        }
                    }
                });

                $scope.isPagingOff = function () {
                    if ($scope.state.query.controls
                        && $scope.state.query.controls.template
                        && $scope.state.query.paged.ispaged) {
                        return $scope.state.query.paged.ispaged === 'Off';
                    } else {
                        return true;
                    }
                }

                $scope.stringToColour = function (i) {
                    var num = (i + 1) * 500000;
                    if ((i % 2) == 0) {
                        num = num * 100;
                    }
                    num >>>= 0;
                    var b = num & 0xFF,
                        g = (num & 0xFF00) >>> 8 % 255,
                        r = (num & 0xFF0000) >>> 16 % 255;
                    return "rgb(" + [r, g, b].join(",") + ")";
                }

                $scope.toChart = function (data) {
                    var x = 'x', y = 'y', z = 'z';//begin,value,name
                    var retData = [];
                    var index = {};
                    var payload = data;
                    for (var i = 0; i < payload.length; i++) {
                        var curSeries = payload[i][z];
                        if (!(curSeries in index)) {
                            retData.push({
                                values: [],
                                key: curSeries,
                                color: $scope.stringToColour(i),
                                strokeWidth: 3,
                                classed: 'dashed'
                            });
                            index[curSeries] = retData.length - 1;
                        }
                        retData[index[curSeries]].values.push({
                            x: payload[i][x],
                            y: payload[i][y]
                        });
                    }
                    return retData;
                };

                $scope.toTable = function (data) {
                    var x = 'x', y = 'y', z = 'z';//begin,value,name
                    var retData = [], index = {}, zlist = [];
                    var payload = data;
                    for (var i = 0; i < payload.length; i++) {
                        var curSeries = payload[i][x];
                        if (!(curSeries in index)) {
                            retData.push({
                                values: {},
                                x: curSeries,
                            });
                            index[curSeries] = retData.length - 1;
                        };
                        retData[index[curSeries]].values[payload[i][z]] = payload[i][y];
                        if (!zlist.includes(payload[i][z]))
                            zlist.push(payload[i][z]);
                    }
                    return { zlist: zlist.sort(), data: retData };
                };
            }
        };
    })
    .directive('vizTransform', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-transform.html'),
            controller: function ($scope) {

            }
        };
    })
    .directive('vizConfig', function (dashletcomssrv) {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                widgetid: '=',
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-config.html'),
            controller: function ($scope) {

                $scope.$on('globalsettings-refreshToggle', function (event, arg) {
                    if (arg.new) {
                        if (!$scope.state.config.slave) {
                            $scope.state.config.autorefresh = 'On';
                        }
                    } else {
                        $scope.state.config.autorefresh = 'Off';
                    }
                });

                $scope.loadConfigPreset = function (preset) {
                    $scope.currentconfig = preset;
                    $scope.state.config = $scurrentconfig;
                };

                $scope.loadMaster = function (m) {
                    $scope.$emit('master-loaded', m);
                };

                $scope.titleChange = function () {
                    $scope.$emit('dashlettitle-change', { newValue: $scope.state.title })
                };

                $scope.titleChange();



                //Master-slave

                $scope.undoMaster = function () {
                    // we shouldn't be registered if we don't have an unwatcher
                    dashletcomssrv.unregisterWidget($scope.widgetid);
                    if ($scope.unwatchMaster) {
                        //dashletcomssrv.unregisterWidget($scope.widgetid);
                        $scope.unwatchMaster();
                    }
                }

                $scope.undoSlave = function () {
                    if ($scope.unwatchSlave) {
                        $scope.unwatchSlave();
                    }
                }

                $scope.$on('coms-reset', function () {
                    if ($scope.state.config.master) {
                        $scope.state.config.master = !$scope.state.config.master;
                    }
                    $scope.undoMaster();

                    if ($scope.state.config.slave) {
                        $scope.state.config.slave = !$scope.state.config.slave;
                    }
                    $scope.undoSlave();
                });

                // clean up when slave unchecked
                // state.config.slave

                $scope.$on('isMaster-changed', function (event, newValue) {
                    if (!newValue) {
                        dashletcomssrv.registerWidget($scope.widgetid, $scope.state.title);
                        //updating both values upon change on transformed for optimization/simplicity
                        // could be two distinct updates via service
                        $scope.unwatchMaster = $scope.$watch('state.data.transformed', function (newValue) {
                            dashletcomssrv.updateMasterValue($scope.widgetid, { transformed: angular.toJson(newValue.dashdata), raw: angular.toJson($scope.state.data.rawresponse.dashdata)});
                        });
                    }
                    else {
                        $scope.undoMaster();
                    }
                });

                $scope.$watch('state.title', function (newValue) {
                    if ($scope.state.config.master) {
                        dashletcomssrv.udpdateTitle($scope.widgetid, newValue);
                    }
                });

                $scope.unwatchSlave = '';

                $scope.startWatchingMaster = function (masterid) {
                    if ($scope.state.config.slave) {
                        var unwatcher = $scope.$watch(function () {
                            return dashletcomssrv.buffer[masterid];
                        }, function (newvalue) {
                            try {
                                if ($scope.state.config.target) {
                                    // watcher not firing if using bracket syntax...
                                    var target = $scope.state.config.target;
                                    if (target === 'state.data.transformed') {
                                        $scope.state.data.transformed = { dashdata: JSON.parse(newvalue.transformed) };
                                    }
                                    if (target === 'state.data.rawresponse') {
                                        $scope.state.data.rawresponse = { dashdata: JSON.parse(newvalue.raw) };
                                    }
                                } else {
                                    console.log('slave target is undefined.')
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                        $scope.unwatchSlave = unwatcher;
                    }
                };

                $scope.$watch('state.config.slave', function (newValue) {
                    if (!newValue) {
                        $scope.undoSlave();
                    }
                });

                // no watching directly on the checkbox, only doing something once a master is picked
                $scope.$on('master-loaded', function (event, master) {
                    //if master already previously selected, stop watching him
                    $scope.undoSlave();
                    $scope.state.config.currentmaster = master;
                    $scope.startWatchingMaster(master.oid);
                });

                // bind service masters to config master selection list
                $scope.$watch(function () {
                    return dashletcomssrv.masters;
                }, function (newValue) {
                    $scope.state.config.masters = newValue;
                });

                $scope.$on('single-remove', function (event, arg) {
                    if (arg === $scope.widgetid) {
                        $scope.prepareRemove();
                    }
                });

                $scope.$on('global-remove', function (event, arg) {
                    $scope.prepareRemove();
                });

                $scope.prepareRemove = function () {
                    if ($scope.state.config.master) {
                        dashletcomssrv.unregisterWidget($scope.widgetid);
                    }
                }

                // after dashlet loaded or duplicated
                if ($scope.state.config.currentmaster) { //slave
                    $scope.startWatchingMaster($scope.state.config.currentmaster.oid);
                } if ($scope.state.config.master) { //master
                    //this is only an attempt. reregistration is avoided at service level
                    dashletcomssrv.registerWidget($scope.widgetid, $scope.state.title);
                }
            }
        }
    })
    .directive('vizInfo', function () {
        return {
            restrict: 'E',
            scope: {
                formwidth: '=',
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-info.html'),
            controller: function ($scope) { }
        }
    })
    .directive('jsonText', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function into(input) {
                    return JSON.parse(input);
                }
                function out(data) {
                    return JSON.stringify(data);
                }
                ngModel.$parsers.push(into);
                ngModel.$formatters.push(out);
            }
        };
    })
    .directive('vizQService', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-service.html'),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQInput', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-input.html'),
            controller: function ($scope) {

                $scope.globalsettings = [];

                $scope.loadQueryPreset = function (querypreset) {
                    $scope.state.query = querypreset.query;
                }

                $scope.$on('key-val-collection-change-Placeholders', function (event, arg) {
                    $scope.templateplaceholders = arg.collection;
                    $scope.change(false);
                });

                $scope.processTemplate = function (placeholders) {
                    var data = runRequestProc(
                        $scope.state.query.datasource.service.preproc.replace.function,
                        $scope.state.query.controls.template.templatedPayload,
                        evalDynamic($scope.mergePlaceholders()));

                    var params = runRequestProc(
                        $scope.state.query.datasource.service.preproc.replace.function,
                        $scope.state.query.controls.template.templatedParams,
                        evalDynamic($scope.mergePlaceholders()));

                    return {
                        data: data,
                        params: params
                    };
                }

                // integration with outer settings via events
                $scope.$on('globalsettings-change', function (event, arg) {
                    $scope.globalsettings = arg.collection;

                    // when no template has been loaded, just save the data, no need to trigger an update
                    if ($scope.state.query.controls && $scope.state.query.controls.template) {
                        $scope.change(arg.async);
                    }
                });

                $scope.mergePlaceholders = function (placeholders) {
                    var phcopy = JSON.parse(JSON.stringify($scope.state.query.controls.template.placeholders));
                    var gscopy = JSON.parse(JSON.stringify($scope.globalsettings));
                    var pagingph = [];

                    if ($scope.state.query.controls.template && $scope.state.query.paged.ispaged === 'On') {
                        pagingph.push({ key: $scope.state.query.paged.offsets.first.vid, value: $scope.state.query.paged.offsets.first.state });
                        if ($scope.state.query.paged.offsets.second) {
                            pagingph.push({ key: $scope.state.query.paged.offsets.second.vid, value: $scope.state.query.paged.offsets.second.state });
                        }
                    }
                    return gscopy.concat(phcopy).concat(pagingph); // global settings dominate local placeholders
                };

                $scope.loadTemplatePreset = function (template) {
                    $scope.state.query = template.queryTemplate;
                    if (!$scope.state.query.controls) {
                        $scope.state.query.controls = { template: {} };
                    }
                    $scope.state.query.controls.template.templatedPayload = template.templatedPayload;
                    $scope.state.query.controls.template.templatedParams = template.templatedParams;
                    $scope.state.query.controls.template.placeholders = template.placeholders;

                    // already updated due to paging event/callback
                    //$scope.change();

                    $scope.$emit('templateph-loaded');
                };

                $scope.$on('update-template-nofire', function () {
                    $scope.change();
                });

                $scope.$on('update-template', function () {
                    $scope.change();
                    $scope.$emit('template-updated');
                });

                $scope.change = function (async) {
                    var appliedTemplate = $scope.processTemplate();
                    $scope.state.query.datasource.service.data = appliedTemplate.data;
                    $scope.state.query.datasource.service.params = appliedTemplate.params;
                }

                $scope.$emit('dashletinput-ready');
            }
        };
    })
    .directive('vizQPreproc', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-preproc.html'),
            controller: function ($scope) {
            }
        };
    })
    .directive('vizQPostproc', function () {
        return {
            restrict: 'E',
            scope: {
                state: '=',
                presets: '='
            },
            templateUrl: resolveTemplateURL('viz-query.js', 'viz-q-postproc.html'),
            controller: function ($scope) {
            }
        };
    });
registerScript();

angular.module('viz-dashboard', ['viz-mgd-widget', 'ui.bootstrap', 'dashletcomssrv'])
    .directive('vizDashboard', function () {
        return {
            restrict: 'E',
            scope: {
                dashboard: '=',
                dashboardid: '=',
                displaymode: '=',
                presets: '=',
                mgrstate: '=',
                headersheightinput: '=',
                charttocontainerinput: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard.html'),
            controller: function ($scope, dashletcomssrv) {

                if (!$scope.headersheightinput) {
                    $scope.headersheight = 250;
                }else{
                    $scope.headersheight = $scope.headersheightinput;
                }

                if (!$scope.charttocontainerinput) {
                    $scope.charttocontainer = 35;
                }else{
                    $scope.charttocontainer = $scope.charttocontainerinput;
                }

                $scope.headHeight =  $scope.headersHeight;
                $scope.chartRatio =  $scope.chartToContainer;

                $scope.wwrap = $scope.dashboard.widgets;

                // load time case
                if ($scope.mgrstate.globalsettingsautorefresh) {
                    $scope.toggleAutorefresh();
                }

                $scope.toggleAutorefresh = function () {
                    $scope.mgrstate.globalsettingsautorefresh = !$scope.mgrstate.globalsettingsautorefresh;
                    if ($scope.mgrstate.globalsettingsautorefresh) {
                        $scope.addInterval();
                    } else {
                        $scope.removeInterval();
                    }
                    $scope.$broadcast('globalsettings-refreshToggle', { 'new': $scope.mgrstate.globalsettingsautorefresh })
                };

                $scope.addInterval = function () {
                    $scope.mgrstate.gsautorefreshInterval = setInterval(function () {
                        $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings, async: true });
                    }, setIntervalDefault);
                }

                $scope.removeInterval = function () {
                    clearInterval($scope.mgrstate.gsautorefreshInterval);
                }

                $scope.$on('key-val-collection-change-Global Settings', function (event, arg) {
                    arg.async = false;
                    $scope.$broadcast('globalsettings-change', arg);
                });

                $scope.$on('dashletinput-ready', function () {
                    $scope.$broadcast('globalsettings-change', { 'collection': $scope.mgrstate.globalsettings });
                });

                $scope.toggleChevron = function () {
                    $scope.mgrstate.globalsettingschevron = !$scope.mgrstate.globalsettingschevron;
                };

                $scope.$on('mgdwidget-remove', function (event, arg) {
                    dashletcomssrv.unregisterWidget(arg.wid);
                    $scope.wwrap.removeById(arg.wid);
                });
                $scope.$on('mgdwidget-moveLeft', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex > 0) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex - 1);
                    }
                });
                $scope.$on('mgdwidget-moveRight', function (event, arg) {
                    var widgetIndex = $scope.wwrap.getIndexById(arg.wid);
                    if (widgetIndex < $scope.wwrap.count() - 1) {
                        $scope.wwrap.moveFromToIndex(widgetIndex, widgetIndex + 1);
                    }
                });
                $scope.$on('mgdwidget-duplicate', function (event, arg) {
                    $scope.wwrap.duplicateById(arg.wid);
                });

                $scope.$on('clearwidgets', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        $scope.wwrap.clear();
                    }
                });

                $scope.$on('addwidget', function (event, arg) {
                    if ($scope.dashboardid === arg.dashboardid) {
                        var newWidgetId = $scope.wwrap.addNew(new DefaultWidget($scope.chartHeightSmall, $scope.chartWidthSmall, $scope.innerContainerHeightSmall, $scope.innerContainerWidthSmall));
                    }
                });

                $(window).on('resize', function () {
                    $scope.$broadcast('resize-widget');
                });

                $(document).ready(function () {
                    $scope.$broadcast('resize-widget');
                });

                $scope.$emit('dashboard-ready');
            }
        };
    })

;
registerScript();

angular.module('viz-dashboard-manager', ['viz-dashboard', 'ui.bootstrap', 'dashletcomssrv'])   
.directive('vizDashboardManager', function () {
        return {
            restrict: 'E',
            scope: {
                presets: '=',
                dashboards: '=',
                displaymode: '='
            },
            templateUrl: resolveTemplateURL('viz-dashboard.js', 'viz-dashboard-manager.html'),
            controller: function ($scope, dashletcomssrv) {
                $scope.dwrap = new IdIndexArray($scope.dashboards);

                // default tab (1st)
                if ($scope.dashboards.length > 0 && $scope.dashboards[0] && $scope.dashboards[0].oid) {
                    $scope.mgrtabstate = $scope.dashboards[0].oid;
                }

                $scope.selectTab = function (tabIndex) {
                    $scope.mgrtabstate = tabIndex;
                };

                $scope.isTabActive = function (tabIndex) {
                    return tabIndex === $scope.mgrtabstate;
                };

                $scope.$on('removeDashboard', function (event, arg) {
                    //If the currently opened tab is killed
                    if ($scope.mgrtabstate === arg) {
                        // if has previous, open previous
                        if ($scope.dwrap.getIndexById($scope.mgrtabstate) > 0) {
                            $scope.mgrtabstate = $scope.dwrap.getPreviousId($scope.mgrtabstate);
                        } else {// if has next, open next
                            if ($scope.dwrap.getIndexById($scope.mgrtabstate) < $scope.dwrap.count() - 1) {
                                $scope.mgrtabstate = $scope.dwrap.getNextId($scope.mgrtabstate);
                            } else {
                                // Empty session
                                $scope.mgrtabstate = null;
                            }
                        }
                    }
                    $.each($scope.dwrap.getById(arg).widgets.getAsArray(), function(idx, value){
                        dashletcomssrv.unregisterWidget(value.oid);
                    })
                    $scope.dwrap.removeById(arg);
                });

                $scope.$on('dashboard-new', function (event, arg) {
                    $scope.dwrap.addNew(new DefaultDashboard([]));
                    $scope.mgrtabstate = $scope.dwrap.getId($scope.dwrap.getByIndex($scope.dwrap.count() - 1));
                });

                $scope.$on('dashboard-clear', function () {
                    $scope.dwrap.clear();
                });

                $scope.$on('dashboard-current-addWidget', function () {
                    $scope.$broadcast('addwidget', { dashboardid: $scope.mgrtabstate });
                });
                $scope.$on('dashboard-current-clearWidgets', function () {
                    $scope.$broadcast('clearwidgets', { dashboardid: $scope.mgrtabstate });
                });


                $scope.$emit('manager-ready');
            }
        };
    });
registerScript();
angular.module('key-val-collection', ['ui.bootstrap'])
    .directive('keyValCollection', function () {
        return {
            restrict: 'E',
            scope: {
                collection: '=',
                collectionname: '='
            },
            templateUrl: resolveTemplateURL('key-val-collection.js', 'key-val-collection.html'),
            controller: function ($scope) {

                $scope.getNumber = function (num) {
                    return new Array(num);
                }

                $scope.addElement = function () {
                    $scope.collection.push({ key: '__?__', value: '?', isDynamic: false });
                    $scope.changed();
                };

                $scope.removeElement = function ($index) {
                    $scope.collection.splice($index, 1);
                    $scope.changed();
                };

                $scope.changed = function(element, elementType){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { type: elementType, element: element, collection: $scope.collection });
                }

                // unused - will probably be discarded in the future, doesn't seem like clean design
                $scope.$on('force-update-' + $scope.collectionname, function(event, arg){
                    $scope.$emit('key-val-collection-change-' + $scope.collectionname, { type: 'forced', element: null, collection: $scope.collection });
                });
            }
        }
    });
registerScript();

angular.module('dashletcomssrv', [])
    .service('dashletcomssrv', function ($rootScope) {
 
        var dashletcomssrv = {};
        dashletcomssrv.buffer = {};
        dashletcomssrv.masters = {};
        dashletcomssrv.masters.array = [];
        dashletcomssrv.masters = new IdIndexArray(dashletcomssrv.masters.array, function(oid){
            //console.log('[dashletcomssrv] removing ' + oid);
        });

        dashletcomssrv.registerWidget = function (widgetid, dashlettitle) {
            dashletcomssrv.masters.addIfAbsent({'oid' : widgetid, 'title': dashlettitle});
        };

        dashletcomssrv.udpdateTitle = function (widgetid, dashlettitle) {
            dashletcomssrv.masters.getById(widgetid).title = dashlettitle;             
        };

        dashletcomssrv.unregisterWidget = function (widgetid) {
            dashletcomssrv.masters.removeIfExists(widgetid);
        };
        
        dashletcomssrv.updateMasterValue = function (widgetid, newValue) {
            dashletcomssrv.buffer[widgetid] = newValue;
        };

        return dashletcomssrv;
    });
function IdIndexArray(arrayArg) {
    if (!arrayArg) {
        throw 'Please provide array ref as argument.';
    }
    return {
        array: arrayArg,
        getId: function (obj) {
            return obj['oid'];
        },
        addNew: function (obj) {
            var newId = getUniqueId();
            obj['oid'] = newId;
            this.array.push(obj);
            return newId;
        },
        addExisting: function (obj) {
            this.array.push(obj);
        },
        clear: function () {
            this.array.length = 0;
        },
        getById: function (oid) {
            var index = this.getIndexById(oid);
            if (index === -1) {
                throw 'No object found with Id:' + oid;
            }
            return this.array[index];
        },
        getByIndex: function (idx) {
            return this.array[idx];
        },
        getIndexById: function (oid) {
            for (i = 0; i < this.array.length; i++) {
                if (this.array[i]['oid'] === oid) {
                    return i;
                }
            }
            return -1;
        },
        getIdByIndex: function (idx) {
            return this.array[idx]['oid'];
        },
        removeById: function (oid) {
            this.array.splice(this.getIndexById(oid), 1);
        },
        removeByIndex: function (idx) {
            var oid = this.getIdByIndex(idx);
            this.array.splice(idx, 1);
        },
        copyById: function (oid) {
            var copy = jsoncopy(this.getById(oid));
            copy['oid'] = getUniqueId();
            return copy;
        },
        duplicateById: function (oid) {
            var newId = this.addExisting(this.copyById(oid)); // pushed at the end of the array
            var copyIdx = this.getIndexById(newId);
            var originalIdx = this.getIndexById(oid);
            this.moveFromToIndex(copyIdx, originalIdx + 1);
        },
        moveFromToIndex: function (old_index, new_index) {
            this.array.splice(new_index, 0, this.array.splice(old_index, 1)[0]);
        },
        count: function () {
            return this.array.length;
        },
        getPrevious: function (oid) {
            return this.getByIndex(this.getIndexById(oid) - 1);
        },
        getPreviousId: function (oid) {
            return this.getId(this.getPrevious(oid));
        },
        getNext: function (oid) {
            return this.getByIndex(this.getIndexById(oid) + 1);
        },
        getNextId: function (oid) {
            return this.getId(this.getNext(oid));
        },
        addIfAbsent: function (obj) {
            if (!(obj['oid'])) {
                return this.addNew(obj);
            }
            var index = this.getIndexById(obj['oid']);
            if (index < 0) {
                return this.addExisting(obj);
            }
            //already present
            return index;
        },
        removeIfExists: function (oid) {
            if (!oid) {
                throw 'Cant remove object without proper oid';
            }
            var index = this.getIndexById(oid);
            if (index < 0) {
                //doesn't exist
                return -1;
            }
            //found
            return this.removeByIndex(index);
        },
        removeAll: function () {
            for (var i = 0; i < this.array.length; i++) {
                this.removeByIndex(i);
            }
        },
        getAsArray: function(){
            return this.array;
        }
    };
};