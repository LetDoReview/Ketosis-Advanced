/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SETUP
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
( function( $ ) {
    var _extensions = {
            navigator: {
                is: ( function is( ) { // TRUE BROWSER DETECTION
                    var ua = navigator.userAgent,
                        tem,
                        M = ua.match( /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i ) || [ ];
                    if ( /trident/i.test( M[ 1 ] ) ) {
                        tem = /\brv[ :]+(\d+)/g.exec( ua ) || [ ];
                        return 'IE ' + ( tem[ 1 ] || '' );
                    }
                    if ( M[ 1 ] === 'Chrome' ) {
                        tem = ua.match( /\b(OPR|Edge)\/(\d+)/ );
                        if ( tem !== null ) return tem.slice( 1 ).join( ' ' ).replace( 'OPR', 'Opera' );
                    }
                    M = M[ 2 ] ? [ M[ 1 ], M[ 2 ] ] : [ navigator.appName, navigator.appVersion, '-?' ];
                    if ( ( tem = ua.match( /version\/(\d+)/i ) ) !== null ) M.splice( 1, 1, tem[ 1 ] );
                    return M.join( ' ' );
                } )( ),
            },
            window: {
                Public: {
                    log: function log( _message, _type ) {
                        var _arguments = Array.from( arguments );
                        _type = 'log';
                        if ( console[ _arguments[ _arguments.length - 1 ] ] !== undefined ) _type = _arguments.pop( );
                        _message = _arguments;
                        _message.unshift( ( this.module ? this.module.name : this.name || 'DEBUG' ).toUpperCase( ) + ':' )
                        console[ _type ].apply( console[ _type ], _message );
                    },
                    on: function on( _event, _action ) {
                        if ( _event === undefined ) return this.__events__;
                        this.__events__[ _event ] = this.__events__[ _event ] || [ ];
                        if ( _action === undefined ) {
                            var _return = function( ) {
                                this.trigger.apply( this, arguments );
                            };
                            return _return.bind( this );
                        }
                        return this.__events__[ _event ].push( _action.bind( this ) );
                    },
                    trigger: function trigger( _event, _data ) {
                        if ( this.__events__[ _event ] !== undefined ) {
                            var _self = this,
                                _arguments = Array.from( arguments ),
                                _timestamp = new Date( ).getTime( ),
                                _actions = [ ];
                            _event = _arguments.shift( );
                            _actions = this.__events__[ _event ];
                            _arguments.push( _timestamp );
                            _actions.forEach( function( _function ) {
                                _function.bind( _self ).apply( _function, _arguments );
                            } );
                            ( this.__events__.triggered || [ ] ).forEach( function( _function ) {
                                _function.bind( _self ).apply( _function, ( [ _event ] ).concat( _arguments ) );
                            } );
                        }
                    },
                },
                repeat: function repeat( _count, _action ) {
                    for ( var _number = 0; _number < _count; _number++ ) _action( _number );
                },
                unless: function unless( _test, _action ) {
                    if ( !_test ) _action( );
                },
                debounce: function debounce( _function, _wait, _immediate ) {
                    var _timeout;
                    return function( ) {
                        var _context = this,
                            _arguments = arguments,
                            _later = function( ) {
                                _timeout = null;
                                if ( !_immediate ) _function.apply( _context, _arguments );
                            },
                            _now = _immediate && !_timeout;
                        clearTimeout( _timeout );
                        _timeout = setTimeout( _later, _wait );
                        if ( _now ) _function.apply( _context, _arguments );
                    };
                },
                collectionHas: function collectionHas( _collection, _needle ) {
                    for ( var _index = 0, _length = _collection.length; _index < _length; _index++ ) {
                        if ( _collection[ _index ] == _needle ) return true;
                    }
                    return false;
                },
                CSSScopedStyles: function CSSScopedStyles( _css, _prefix ) {
                    var _regexp = new RegExp( "([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)", "g" );
                    _css = _css.replace( _regexp, function( _g0, _g1, _g2 ) {
                        if ( _g1.match( /^\s*(@media|@keyframes|to|from|@font-face)/ ) ) return _g1 + _g2;
                        if ( _g1.match( /:parent/ ) ) _g1 = _g1.replace( /([^\s]*):parent/, function( _h0, _h1 ) {
                            return _h1;
                        } );
                        _g1 = _g1.replace( /^(\s*)/, "$1" + _prefix + " " );
                        return _g1 + _g2;
                    } );
                    return '\n' + _css.trim( ).replace( /\n[ ]+/g, '\n' );
                },
            },
            Array: {
                from: ( function( ) {
                    var toStr = Object.prototype.toString;
                    var isCallable = function( fn ) {
                        return typeof fn === 'function' || toStr.call( fn ) === '[object Function]';
                    };
                    var toInteger = function( value ) {
                        var number = Number( value );
                        if ( isNaN( number ) ) {
                            return 0;
                        }
                        if ( number === 0 || !isFinite( number ) ) {
                            return number;
                        }
                        return ( number > 0 ? 1 : -1 ) * Math.floor( Math.abs( number ) );
                    };
                    var maxSafeInteger = Math.pow( 2, 53 ) - 1;
                    var toLength = function( value ) {
                        var len = toInteger( value );
                        return Math.min( Math.max( len, 0 ), maxSafeInteger );
                    };
                    // The length property of the from method is 1.
                    return function from( arrayLike /*, mapFn, thisArg */ ) {
                        // 1. Let C be the this value.
                        var C = this;
                        // 2. Let items be ToObject(arrayLike).
                        var items = Object( arrayLike );
                        // 3. ReturnIfAbrupt(items).
                        if ( arrayLike == null ) {
                            throw new TypeError( 'Array.from requires an array-like object - not null or undefined' );
                        }
                        // 4. If mapfn is undefined, then let mapping be false.
                        var mapFn = arguments.length > 1 ? arguments[ 1 ] : void undefined;
                        var T;
                        if ( typeof mapFn !== 'undefined' ) {
                            // 5. else
                            // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                            if ( !isCallable( mapFn ) ) {
                                throw new TypeError( 'Array.from: when provided, the second argument must be a function' );
                            }
                            // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                            if ( arguments.length > 2 ) {
                                T = arguments[ 2 ];
                            }
                        }
                        // 10. Let lenValue be Get(items, "length").
                        // 11. Let len be ToLength(lenValue).
                        var len = toLength( items.length );
                        // 13. If IsConstructor(C) is true, then
                        // 13. a. Let A be the result of calling the [[Construct]] internal method
                        // of C with an argument list containing the single item len.
                        // 14. a. Else, Let A be ArrayCreate(len).
                        var A = isCallable( C ) ? Object( new C( len ) ) : new Array( len );
                        // 16. Let k be 0.
                        var k = 0;
                        // 17. Repeat, while k < len… (also steps a - h)
                        var kValue;
                        while ( k < len ) {
                            kValue = items[ k ];
                            if ( mapFn ) {
                                A[ k ] = typeof T === 'undefined' ? mapFn( kValue, k ) : mapFn.call( T, kValue, k );
                            } else {
                                A[ k ] = kValue;
                            }
                            k += 1;
                        }
                        // 18. Let putStatus be Put(A, "length", len, true).
                        A.length = len;
                        // 20. Return A.
                        return A;
                    };
                }( ) ),
            },
            Object: {
                extend: $.extend,
                listen: function listen( _object ) {
                    if ( Object.isFunction( _object ) ) {
                        _object.__events__ = {};
                        _object.on = function on( _event, _action ) {
                            if ( _event === undefined ) return _object.__events__;
                            if ( _action === undefined ) return _object.__events__[ _event ] || function( ) {};
                            return _object.__events__[ _event ] = _action.bind( _object );
                        };
                    } else if ( Object.isObject( _object ) ) {
                        for ( var _key in _object ) {
                            Object.listen( _object[ _key ] );
                        }
                    }
                },
            },
            JSON: {
                serialize: function serialize( _data ) {
                    var _url = '';
                    for ( var _prop in _data ) {
                        _url += encodeURIComponent( _prop ) + '=' + encodeURIComponent( _data[ _prop ] ) + '&';
                    }
                    return _url.substring( 0, _url.length - 1 );
                }
            },
            Image: {
                preload: function( _src ) {
                    var _arguments = Array.from( arguments ),
                        _index = _arguments.length;
                    while ( _index-- ) {
                        var _img = new Image( );
                        _img.src = _arguments[ _index ];
                    }
                },
            },
        },
        _prototype = {
            Function: {
                __events__: {},
                on: _extensions.window.Public.on,
                trigger: _extensions.window.Public.trigger,
                expecting: function expecting( ) {
                    var _self = this,
                        _string = _self.toString( ).replace( /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '' ),
                        _result = _string.slice( _string.indexOf( '(' ) + 1, _string.indexOf( ')' ) ).match( /([^\s,]+)/g ) || [ ];
                    return _result;
                },
                debug: function debug( ) {
                    var _arguments = Array.from( arguments ),
                        _args = this.expecting( ).reduce( function( obj, k, ix ) {
                            obj[ k ] = _arguments[ ix ];
                            return obj;
                        }, {} ),
                        _returns = this.apply( this, _arguments );
                    console.log( this.name, _args, _returns );
                    return _returns;
                },
            },
            Array: {
                first: function first( ) {
                    return this[ 0 ];
                },
                last: function last( ) {
                    return this[ this.length - 1 ];
                },
                random: function random( ) {
                    return this[ Math.round( Math.random( ) * ( this.length - 1 ) ) ];
                },
                contains: function contains( _needle ) {
                    return this.indexOf( _needle ) >= 0;
                },
                consolidate: function consolidate( ) {
                    var _result = [ ];
                    this.forEach( function( _value ) {
                        if ( !_result.contains( _value ) ) _result.push( _value );
                    } );
                    return _result;
                },
                move: function move( _old, _new ) {
                    if ( _new >= this.length ) {
                        var _pos = _new - this.length;
                        while ( ( _pos-- ) + 1 ) {
                            this.push( undefined );
                        }
                    }
                    this.splice( _new, 0, this.splice( _old, 1 )[ 0 ] );
                    return this;
                },
                insert: function insert( _value, _index ) {
                    this.splice( _index, 0, _value );
                    return this;
                },
                indexOf: function indexOf( _value ) {
                    for ( var _index = 0; _index < this.length; _index++ ) {
                        if ( this[ _index ] === _value ) return _index;
                    }
                },
            },
            String: {
                externalLink: function externalLink( ) {
                    if ( this.contains( 'http' ) || this.contains( '//' ) ) {
                        if ( this.contains( window.location.host ) ) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                },
                capitalize: function capitalize( _seperator ) {
                    return this.replace( new RegExp( '(^\\w)|([' + ( _seperator || '' ) + ']\\w)|([' + ( _seperator || '' ) + ']\\s*\\w)', 'g' ), function( l ) {
                        return l.toUpperCase( );
                    } );
                },
                format: function format( ) {
                    var _arguments = Array.from( arguments );
                    return this.replace( /\{\{(\d+)\}\}/g, function( _match, _number ) {
                        return typeof _arguments[ _number ] != 'undefined' ? _arguments[ _number ] : _match;
                    } ).replace( /\{\{(\+)\}\}/g, '' );
                },
                trim: function trim( ) {
                    return this.replace( /^\s+|\s+$/g, "" );
                },
                ltrim: function ltrim( ) {
                    return this.replace( /^\s+/g, "" );
                },
                rtrim: function rtrim( ) {
                    return this.replace( /\s+$/g, "" );
                },
                startsWith: function startsWith( _string, _position ) {
                    _position = _position || 0;
                    return this.indexOf( _string, _position ) === _position;
                },
                endsWith: function endsWith( _string, _position ) {
                    var _sub = this.toString( );
                    if ( Object.isNumber( _position ) || !isFinite( _position ) || Math.floor( _position ) !== _position || _position > _sub.length ) _position = _sub.length;
                    _position -= _string.length;
                    var _last = _sub.indexOf( _string, _position );
                    return _last !== -1 && _last === _position;
                },
                contains: function contains( ) {
                    'use strict';
                    return String.prototype.indexOf.apply( this, arguments ) !== -1;
                },
                repeat: function repeat( _amount ) {
                    'use strict';
                    var _string = '' + this,
                        _repeat = '';
                    if ( this === null ) throw new TypeError( 'can\'t convert ' + this + ' to object' );
                    _amount = +_amount;
                    if ( _amount != _amount ) _amount = 0;
                    if ( _amount < 0 ) throw new RangeError( 'repeat count must be non-negative' );
                    if ( _amount == Infinity ) throw new RangeError( 'repeat count must be less than infinity' );
                    _amount = Math.floor( _amount );
                    if ( _string.length === 0 || _amount === 0 ) return '';
                    if ( _string.length * _amount >= 1 << 28 ) throw new RangeError( 'repeat count must not overflow maximum string size' );
                    for ( ;; ) {
                        if ( ( _amount & 1 ) == 1 ) _repeat += _string;
                        _amount >>>= 1;
                        if ( _amount === 0 ) break;
                        _string += _string;
                    }
                    return _repeat;
                },
                escape: function escape( ) {
                    return encodeURIComponent( this );
                },
                unescape: function unescape( ) {
                    return decodeURIComponent( this );
                },
                diff: function( str ) {
                    var differences = {
                            'control': this.toString( ),
                            'variable': str,
                            'length': 0
                        },
                        base = ( this.length >= str.length ) ? this.length : str.length;
                    for ( var a = 0; a < base; a++ ) {
                        if ( str[ a ] === undefined || this[ a ] !== str[ a ] ) {
                            differences[ a ] = str[ a ];
                            differences.length++;
                        }
                    }
                    return differences;
                },
            },
            Element: {
                getComputedStyle: function getComputedStyle( ) {
                    return window.getComputedStyle( this );
                },
                hasClass: function hasClass( _class ) {
                    return $( this ).hasClass( _class );
                },
                addClass: function addClass( _class ) {
                    $( this ).addClass( _class );
                    return this;
                },
                removeClass: function removeClass( _class ) {
                    $( this ).removeClass( _class );
                    return this;
                },
                toggleClass: function toggleClass( _class ) {
                    $( this ).toggleClass( _class );
                    return this;
                },
            },
        },
        _types = [ 'Array', 'Object', 'Function', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Element', 'Image' ];
    // Add type checking functions.
    _types.forEach( function( _type ) {
        ( function( _type ) {
            _extensions.Object[ 'is' + _type ] = function( _input ) {
                return Object.prototype.toString.call( _input ).indexOf( _type ) > -1 || _input.constructor.name === _type;
            }
        } )( _type );
    } );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // APPLY EXTENSIONS
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for ( var _type in _extensions ) {
        $.extend( window[ _type ], _extensions[ _type ] );
    }
    for ( var _type in _prototype ) {
        $.extend( window[ _type ].prototype, _prototype[ _type ] );
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SCOPED STYLE EXTENSION
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    Object.extend( window.CSSScopedStyles, {
        init: function init( ) {
            var _style = document.createElement( "style" );
            _style.appendChild( document.createTextNode( "" ) );
            document.head.appendChild( _style );
            _style.sheet.insertRule( "body{visibility:hidden;}", 0 );
            $( window.CSSScopedStyles.process );
        },
        process: function process( ) {
            var _styles = document.body.querySelectorAll( "style[scoped]" );
            if ( _styles.length === 0 ) return document.getElementsByTagName( "body" )[ 0 ].style.visibility = "visible";
            var _head = document.head || document.getElementsByTagName( "head" )[ 0 ],
                _newstyle = document.createElement( "style" ),
                _csses = "";
            for ( var _index = 0; _index < _styles.length; _index++ ) {
                var _style = _styles[ _index ],
                    _css = _style.innerHTML;
                if ( _css && ( _style.parentElement.nodeName !== "BODY" ) ) {
                    _csses = _csses + CSSScopedStyles( _css, _style.parentNode.selector );
                    _style.parentNode.removeChild( _style );
                }
            }
            if ( _newstyle.styleSheet ) {
                _newstyle.styleSheet.cssText = _csses;
            } else {
                _newstyle.appendChild( document.createTextNode( _csses ) );
            }
            _newstyle.id = 'ScopedStyles';
            _head.appendChild( _newstyle );
            document.getElementsByTagName( "body" )[ 0 ].style.visibility = "visible";
        },
    } );
    if ( "scoped" in document.createElement( "style" ) === false ) window.CSSScopedStyles.init( );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CORE FUNCTIONALITY
    // Here we are defining various new functions for jQuery using the first function, "define".
    // There is nothing special about define, except for it being a safer and more efficient way to add new functions to jQuery.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Boost-style plugin factory.
    $.define = function( _name, _constructor, _callback, _overwrite ) {
        _callback = _callback || function( ) {};
        if ( $[ _name ] === undefined || _overwrite === true ) {
            $[ _name ] = ( Object.isFunction( _constructor ) ) ? _constructor.bind( $ ) : _constructor;
            _callback.apply( $[ _name ], [ $[ _name ] ] );
        }
    };
    $.define( 'redefine', function( _name, _constructor, _callback ) {
        $.define( _name, _constructor, _callback, true );
    } );
    // Boost-style method factory.
    $.define( 'new', function( _name, _fn, _callback, _overwrite ) {
        _callback = _callback || function( ) {};
        if ( $.fn[ _name ] === undefined || _overwrite === true ) {
            $.fn[ _name ] = _fn;
        }
        _callback.apply( $[ _name ], [ $[ _name ] ] );
    } );
    // "Boosting" a jQuery method keeps the legacy functionality
    // but allows for redefining the function as needed.
    $.define( 'boost', function( _obj, _method, _replacement ) {
        if ( _obj[ _method ] === undefined ) return false;
        var _arguments = Array.from( arguments ),
            _original = _obj[ _method ];
        _obj[ _method ] = _replacement;
        _obj[ _method ].legacy = _original;
    } );
    $.define( 'random', function( arr, max ) {
        if ( Array.isArray( arr ) || typeof arr === 'string' ) {
            return arr[ Math.ceil( Math.random( ) * arr.length - 1 ) ];
        } else if ( max ) {
            return Math.floor( Math.random( ) * ( max - arr + 1 ) + arr );
        } else {
            return arr;
        }
    } );
    $.define( 'wait', function( _ms, _callback, _context ) {
        _ms = _ms || 0;
        _callback = _callback || function( ) {};
        _context = _context || window;
        var _interval;
        return _interval = window.setTimeout( _callback.bind( _context ), _ms );
    } );
    $.define( 'interval', function( _ms, _callback, _context ) {
        _ms = _ms || 0;
        _callback = _callback || function( ) {};
        _context = _context || window;
        return window.setInterval( _callback.bind( _context ), _ms );
    } );
    $.define( 'create', function( _type, _attributes, _content ) { // Element creation/manipulation.
        var _element;
        _attributes = _attributes || {};
        _content = _content || '';
        if ( _type.indexOf( '<' ) != -1 ) {
            _element = shadow( _type );
        } else {
            _element = document.createElement( _type );
            for ( var s in _attributes ) {
                _element.setAttribute( s, _attributes[ s ] );
            }
            if ( typeof _content === 'object' && Array.isArray( _content ) ) {
                for ( var a = 0; a < _content.length; a++ ) {
                    if ( typeof _content[ a ] === 'object' ) {
                        _element.appendChild( _content[ a ] );
                    } else {
                        _element.innerHTML += _content[ a ];
                    }
                }
            } else if ( typeof _content === 'object' ) {
                _element.appendChild( _content );
            } else if ( _type === 'input' || _type === 'select' || _type === 'textarea' ) {
                if ( _attributes.type && _attributes.type === 'checkbox' ) {
                    _element.checked = ( _content ) ? true : false;
                } else {
                    _element.value = _content;
                }
            } else {
                try {
                    _element.innerHTML = _content;
                } catch ( e ) {}
            }
        }
        return _element;

        function shadow( _element ) {
            _element = _element || document.getElementsByTagName( 'html' )[ 0 ];
            try {
                _element = $( _element, document )[ 0 ];
            } catch ( e ) {
                _element = _element;
            }
            return render( $.parseDOM( _element ) );

            function render( shadow, root ) {
                root = ( shadow.type ) ? $.create( shadow.type, shadow.attributes ) : shadow;
                if ( !shadow.content || shadow.content.length === 0 ) return root;
                for ( var a = 0; a < shadow.content.length; a++ ) {
                    _content = render( shadow.content[ a ] );
                    if ( typeof _content === 'object' ) {
                        root.appendChild( render( shadow.content[ a ] ) );
                    } else {
                        root.innerHTML = _content;
                    }
                }
                return root;
            }
        }
    } );
    $.define( 'parseDOM', function( _element, _string ) {
        _string = _string || false;
        return mapDOM( _element, _string );

        function mapDOM( _element, _json ) {
            var _treeObject = {},
                _docNode;
            if ( Object.isString( _element ) ) {
                if ( window.DOMParser ) {
                    var _parser = new DOMParser( );
                    _docNode = _parser.parseFromString( _element, 'text/xml' );
                } else {
                    _docNode = new window.ActiveXObject( 'Microsoft.XMLDOM' );
                    _docNode.async = false;
                    _docNode.loadXML( _element );
                }
                _element = _docNode.firstChild;
            }

            function treeHTML( _element, _object ) {
                _object.type = _element.nodeName;
                var _nodeList = _element.childNodes;
                if ( _nodeList !== null ) {
                    if ( _nodeList.length ) {
                        _object.content = [ ];
                        for ( var i = 0; i < _nodeList.length; i++ ) {
                            if ( _nodeList[ i ].nodeType == 3 ) {
                                var _cleanContent = _nodeList[ i ].nodeValue.replace( /\n|[\s]{2,}/g, '' );
                                if ( _cleanContent === '' ) continue;
                                _object.content.push( _cleanContent );
                            } else {
                                _object.content.push( {} );
                                treeHTML( _nodeList[ i ], _object.content[ _object.content.length - 1 ] );
                            }
                        }
                    }
                }
                if ( _element.attributes !== null ) {
                    if ( _element.attributes.length ) {
                        _object.attributes = {};
                        for ( var a = 0; a < _element.attributes.length; a++ ) {
                            _object.attributes[ _element.attributes[ a ].nodeName ] = _element.attributes[ a ].nodeValue.replace( /\n|[\s]{2,}/g, '' );
                        }
                    }
                }
            }
            treeHTML( _element, _treeObject );
            return ( !_json ) ? _treeObject : JSON.stringify( _treeObject );
        }
    } );
    $.define( 'watch', function( _target, _prop, _handler ) { // Variable watching and observing.
        if ( _target.__lookupGetter__ && _target.__lookupGetter__( _prop ) != null ) {
            return true;
        }
        var _oldval = _target[ _prop ],
            _newval = _oldval,
            self = this,
            _getter = function( ) {
                return _newval;
            },
            _setter = function( val ) {
                if ( Array.isArray( val ) ) {
                    val = _extendArray( val, _handler, self );
                }
                _oldval = _newval;
                _newval = val;
                _handler.call( _target, _prop, _oldval, val );
            };
        if ( delete _target[ _prop ] ) { // can't watch constants
            if ( Object.defineProperty ) { // ECMAScript 5
                Object.defineProperty( _target, _prop, {
                    get: _getter,
                    set: _setter,
                    enumerable: false,
                    configurable: true
                } );
            } else if ( Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__ ) { // legacy
                Object.prototype.__defineGetter__.call( _target, _prop, _getter );
                Object.prototype.__defineSetter__.call( _target, _prop, _setter );
            }
        }
        return this;
    } );
    $.watch.update = function( ) {
        $( '[data-watch]', document ).each( function( ) {
            if ( $( this ).is( 'input' ) || this.nodeName.toLowerCase( ) == 'select' || this.nodeName.toLowerCase( ) == 'textarea' || this.nodeName.toLowerCase( ) == 'option' ) {
                this.value = window[ this.getAttribute( 'data-watch' ) ] || this.value || '';
            } else {
                this.innerHTML = window[ this.getAttribute( 'data-watch' ) ] || this.innerHTML || '';
            }
        } );
    };
    $.define( 'unwatch', function( _target, _prop ) {
        var _val = _target[ _prop ];
        delete _target[ _prop ]; // remove accessors
        _target[ _prop ] = _val;
        return this;
    } );
    $.define( 'lazy', function( ) {
        if ( navigator.is.indexOf( 'IE' ) === -1 ) {
            $( '[data-lazy]', document ).each( function( ) {
                if ( $( this ).isVisible( ) ) {
                    switch ( $( this ).is( ) ) {
                        case ( 'img' ):
                            $( this ).attr( 'src', $( this ).attr( 'data-lazy' ) ).removeAttr( 'data-lazy' ).opacity( 100, 250 );
                            break;
                        case ( 'iframe' ):
                            $( this ).attr( 'src', $( this ).attr( 'data-lazy' ) ).removeAttr( 'data-lazy' ).opacity( 100, 250 );
                            break;
                        default:
                            $( this ).css( 'background', 'url("' + $( this ).attr( 'data-lazy' ) + '") ' + $( this ).style( ).backgroundRepeat + ' ' + $( this ).style( ).backgroundPosition ).removeAttr( 'data-lazy' ).opacity( 100, 250 );
                            break;
                    }
                } else {
                    $( this ).css( 'opacity', '0' );
                }
            } );
        } else {
            $( '[data-lazy]', document ).each( function( ) {
                switch ( $( this ).is( ) ) {
                    case 'img':
                        $( this ).attr( 'src', $( this ).attr( 'data-lazy' ) ).removeAttr( 'data-lazy' );
                        break;
                    case ( 'iframe' ):
                        $( this ).attr( 'src', $( this ).attr( 'data-lazy' ) ).removeAttr( 'data-lazy' );
                        break;
                    default:
                        $( this ).css( 'background', 'url("' + $( this ).attr( 'data-lazy' ) + '") ' + $( this ).style( ).backgroundRepeat + ' ' + $( this ).style( ).backgroundPosition ).removeAttr( 'data-lazy' );
                        break;
                }
            } );
        }
    }, function( ) {
        $( window ).on( 'scroll', $.lazy );
        $( window ).on( 'resize', $.lazy );
    } );
    $.define( 'placeholder', function( ) {
        $.placeholder.width = $.placeholder.width || 991;
        $.orientation( );
        $( '[data-placeholder]' ).each( function( ) {
            if ( window.layout.width <= $.placeholder.width ) {
                $( this ).attr( 'placeholder', $( this ).attr( 'data-placeholder' ) );
            } else {
                $( this ).removeAttr( 'placeholder' );
            }
        } );
    }, function( ) {
        $( window ).on( 'scroll', $.placeholder );
        $( window ).on( 'resize', $.placeholder );
    } );
    $.define( 'view', function( _selector, _context ) {
        _context = _context || document;
        if ( $( '[data-viewport],.viewport,#view-xs,#view-sm,#view-md,#view-lg' ).length > 0 ) {
            $( '[data-viewport],.viewport,#view-xs,#view-sm,#view-md,#view-lg' ).each( function( ) {
                if ( $( this ).isVisible( ) ) _context = this;
            } );
        }
        _selector = _selector || _context;
        var _result = [ ];
        $( _selector, _context ).each( function( ) {
            if ( $( this ).isVisible( ) ) _result.push( this );
        } );
        return $( _result );
    } );
    $.define( 'scrollTo', function( _target, _callback ) { // Smoothly scroll to any point/element in the document.
        _callback = _callback || function( ) {};
        if ( 'pageYOffset' in window ) {
            _target = _target || 0;
            if ( typeof _target !== 'number' ) _target = ( $( _target ).length === 1 ) ? $( _target ).offset( ).top + window.pageYOffset - $( _target ).offset( ).height : 0;
            var _offset = window.pageYOffset;
            if ( _offset >= _target + 5 ) {
                window.scrollBy( 0, -( 1 + ( ( _offset - _target ) / 10 ) ) );
            } else if ( _offset <= _target - 5 ) {
                window.scrollBy( 0, 1 + ( ( _target - _offset ) / 10 ) );
            }
            if ( _offset <= _target - 5 || _offset >= _target + 5 ) {
                var _delay = setTimeout( '$.scrollTo(' + _target + ', ' + _callback + ')', 20 );
            } else {
                _callback( );
                window.onmousewheel = function( ) {};
                try {
                    window.addEventListener( 'DOMMouseScroll', function( ) {}, false );
                } catch ( e ) {
                    window.attachEvent( 'DOMMouseScroll', function( ) {} );
                }
                return;
            }
            window.onmousewheel = function( ) {
                _callback( );
                window.clearTimeout( _delay );
                window.onmousewheel = function( ) {};
            };
            try {
                window.addEventListener( 'DOMMouseScroll', function( ) {
                    _callback( );
                    window.clearTimeout( _delay );
                }, false );
            } catch ( e ) {
                window.attachEvent( 'DOMMouseScroll', function( ) {
                    _callback( );
                    window.clearTimeout( _delay );
                } );
            }
        } else {
            _target = _target || '';
            window.location.href = '#' + _target.replace( /(#)|(.)/g, '' );
            _callback( );
        }
    } );
    $.define( 'shuffle', function( _arr ) {
        var _counter = _arr.length,
            _temp, _index;
        while ( _counter > 0 ) {
            _index = Math.floor( Math.random( ) * _counter );
            _counter--;
            _temp = _arr[ _counter ];
            _arr[ _counter ] = _arr[ _index ];
            _arr[ _index ] = _temp;
        }
        return _arr;
    } );
    $.define( 'query', function( search ) {
        var rawQuery = ( ( document.location.search !== '' ) ? document.location.search.substr( 1 ).split( '&' ) : [ ] ),
            query = {};
        for ( var a = 0; a < rawQuery.length; a++ ) {
            var name = rawQuery[ a ].split( '=' )[ 0 ].escape( ),
                value = ( rawQuery[ a ].split( '=' )[ 1 ] || '' ).escape( );
            for ( var b = 2; b < rawQuery[ a ].split( '=' ).length; b++ ) {
                value += '=' + rawQuery[ a ].split( '=' )[ b ];
            }
            query[ name ] = value || 1;
        }
        query.raw = function( ) {
            var serialized = '?';
            for ( var a in query ) {
                if ( typeof query[ a ] != 'string' || a === '' ) continue;
                serialized += ( ( serialized != '?' ) ? '&' : '' ) + a + '=' + ( query[ a ] === 'undefined' ? '1' : query[ a ] );
            }
            return serialized;
        };
        return ( search ) ? query[ search ] : query;
    } );
    $.define( 'navbar', function( _buttons ) {
        if ( !Object.isObject( _buttons ) ) return;
        $.navbar = $( $.create( 'div', {
            'class': 'boost-navbar navbar-fixed-top collapsed',
            'style': 'z-index:999998;'
        }, [
            $.create( 'div', {
                'class': 'container'
            }, $.create( 'ul', {
                'class': 'nav nav-justified'
            } ) ),
            $.create( 'a', {
                'class': 'fa fa-bars hidden-md hidden-lg text-white text-hover',
                'style': 'position:fixed;top:5px;right:10px;text-align:right;font-size:28px;text-decoration:none!important;z-index:999999;',
                'onclick': '$.navbar.toggleClass("collapsed");'
            } )
        ] ) );
        for ( var _btn in _buttons ) {
            $.navbar.find( 'ul' ).append( $.create( 'li', {}, $.create( 'a', _buttons[ _btn ], _btn.replace( /(_)|(-)/g, ' ' ).capitalize( ' ' ) ) ) );
        }
        $( 'body' ).prepend( $.navbar ).wait( 150, function( ) {
            $( this ).addClass( 'in' );
            $( '.viewport' ).each( function( ) {
                $( this ).addClass( 'in' );
            } );
        } );
        return $.navbar;
    } );
    $.define( 'backout', function( _url, _img, _msg ) {
        // if ( _url === undefined ) return;
        // _img = _img || '/boost/img/backout-free-shipping.jpg';
        // _msg = _msg || "For a Limited Time - Get FREE SHIPPING NOW! We will pay 100% of the shipping cost so you can see what this miracle formula can do for you!\n\nIf you are wondering why we are doing this, the simple answer is because we know once you see results, you will refer friends and family. \n\nDon\'t Miss Out on this LIMITED TIME SPECIAL OFFER!";
        // $.backout = $( $.create( 'div', {
        //     'id': 'backout-container',
        //     'style': 'position:fixed;width:100%;height:100%;top:0px;left:0px;display:none;background-color:rgba(0,0,0,0.75);z-index:999999;'
        // } ) );
        // $.backout.active = true;
        // $.backout.modal = $( $.backout.append( $.create( 'div', {
        //     'id': 'backout',
        //     'class': 'z-depth-3',
        //     'style': 'display:block;overflow:hidden;'
        // } ) ) );
        // $.backout.link = $( $.backout.modal.append( $.create( 'a', {
        //     'href': _url
        // } ) ) );
        // $.backout.img = $.backout.link.append( $.create( 'img', {
        //     'src': _img,
        //     'style': 'width:100%;height:100%;'
        // } ) );
        // $.backout.message = _msg;
        // $( 'body' ).append( $.backout );
        // $( window ).on( 'beforeunload', function( e ) {
        //     if ( $.backout.active === true && $.query( 'nb' ) === undefined ) {
        //         e.preventDefault( );
        //         $.backout.active = false;
        //         $.backout.show( );
        //         return $.backout.message;
        //     }
        // } );
        // return $.backout;
    } );
    $.backout.active = false;
    $.define( 'insureship', function( ) {
        // var $seal = $.create( 'div', {
        //     'id': 'ins_seal',
        //     'class': 'hidden-xs',
        //     'onmouseover': '$("#ins_popup").css("display", "block");'
        // }, $.create( 'div', {
        //     'class': 'inner'
        // }, [ $.create( 'img', {
        //     'src': '/boost/img/ins_seal.png'
        // } ), $.create( 'div', {
        //     'id': 'ins_popup',
        //     'onmouseleave': '$("#ins_popup").css("display", "none");'
        // }, $.create( 'img', {
        //     'src': '/boost/img/ins_banner.png',
        //     'style': 'cursor:pointer;',
        //     'onclick': 'window.open( "https://www.insureship.com/website/terms", "Insureship", "height=400,width=650,scrollbars=yes,resizeable=yes" );'
        // } ) ) ] ) );
        // $( 'body' ).append( $seal );
    } );
    $.define( 'modal', {
        'show': function( _content, _static, _close ) {
            $.modal.close( );
            var $tray = $( '.modal-tray' ),
                $modal, $content;
            $modal = $tray.append( 'div' ).addClass( 'sm card col-xs-12 col-sm-10 col-sm-offset-1 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4 no-gutter z-depth-3' );
            $content = $modal.append( 'div' ).addClass( 'card-content col-xs-12' );
            $content.html( _content );
            $( 'body' ).css( {
                'overflow': 'hidden'
            } );
            $tray.wait( 50, function( ) {
                $tray.addClass( ( _static === true ) ? 'static in' : 'in' ).css( {
                    'pointer-events': 'all'
                } );
                $modal.addClass( 'in' );
            } );
            if ( _static !== true || _close === true ) {
                $modal.append( 'a' ).addClass( 'close fa fa-times-circle' ).on( 'click', function( ) {
                    $.modal.close( );
                } );
            }
            $modal.size = function( _size ) {
                switch ( _size ) {
                    case 'lg':
                        this.attr( 'class', 'lg card col-xs-10 col-xs-offset-1 no-gutter z-depth-3' );
                        break;
                    case 'md':
                        this.attr( 'class', 'md card col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3 no-gutter z-depth-3' );
                        break;
                    default:
                        this.attr( 'class', 'sm card col-xs-12 col-sm-10 col-sm-offset-1 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4 no-gutter z-depth-3' );
                        break;
                    case 'xs':
                        this.attr( 'class', 'xs card col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 col-lg-2 col-lg-offset-5 no-gutter z-depth-3' );
                        break;
                }
                return this;
            };
            return $modal;
        },
        'load': function( _url, _get ) {
            $.ajax( _url, {
                data: {
                    data: _get
                }
            } ).then( function( _response ) {
                $.modal.show( _response );
            } );
        },
        'close': function( _modal ) {
            var $tray = ( $( '.modal-tray' ).length > 0 ) ? $( '.modal-tray' ) : $( 'body' ).append( 'div' ).addClass( 'modal-tray' ).on( 'click', function( e ) {
                    if ( e.target === this && $( this ).hasClass( 'static' ) === false ) $.modal.close( );
                } ),
                $modals = $tray.find( _modal || '.card' );
            $modals.each( function( ) {
                $( this ).removeClass( 'in' ).wait( 175, function( ) {
                    $( this ).remove( );
                    $( 'body' ).css( {
                        'overflow': 'auto'
                    } );
                } );
            } );
            if ( _modal === undefined ) {
                $tray.removeClass( 'static', 'in' ).css( {
                    'pointer-events': 'none'
                } );
            }
        },
        'alert': function( _content, _button, _callback, _close ) {
            _close = _close || false;
            _button = _button || 'Ok';
            _callback = _callback || function( ) {};
            var $modal = $.modal.show( _content, true, _close ).size( 'xs' ),
                $buttons = $modal.append( 'div' ).addClass( 'card-choices col-xs-12' ),
                $btn = $buttons.append( 'div' ).addClass( 'col-xs-12' ).append( 'a' ).addClass( 'col-xs-12' ).addClass( 'btn btn-conf' ).text( _button );
            $btn.on( 'click', function( ) {
                $.modal.close( );
                _callback( );
            } );
            return $modal;
        },
        'confirm': function( _content, _choices, _callback, _close ) {
            _close = _close || false;
            _choices = _choices || [ {
                'text': 'Cancel',
                'value': false
            }, {
                'text': 'Ok',
                'value': true
            } ];
            _callback = _callback || function( _val ) {
                $.modal.close( );
            };
            var $modal = $.modal.show( _content, true, _close ),
                $buttons = $modal.append( 'div' ).addClass( 'card-choices col-xs-12' ),
                _size = false;
            for ( var b = 0; b < _choices.length; b++ ) {
                if ( _choices[ b ].text.indexOf( ' ' ) > -1 ) _size = true;
            }
            _size = ( _size === true ) ? '12' : ( 12 / _choices.length ).toString( );
            for ( var a = 0; a < _choices.length; a++ ) {
                var $btn = $buttons.append( 'div' ).addClass( 'col-xs-12 col-md-' + _size ).append( 'a' ).addClass( 'col-xs-12' );
                if ( _choices[ a ].class ) {
                    $btn.addClass( _choices[ a ].class );
                } else {
                    $btn.addClass( 'btn btn-conf' );
                }
                for ( var b in _choices[ a ] ) {
                    switch ( b ) {
                        case 'text':
                            $btn.html( _choices[ a ][ b ] );
                            break;
                        case 'value':
                            $btn.data( b, _choices[ a ][ b ] );
                            break;
                        default:
                            $btn.attr( b, _choices[ a ][ b ] );
                            break;
                    }
                    $btn.on( 'click', function( e ) {
                        _callback( $( this ).data( 'value' ) );
                    } );
                }
            }
            return $modal;
        }
    } );
    $.define( 'card', $.modal );
    $.define( 'escape', function( _string ) {
        return _string.escape( );
    } );
    $.define( 'unescape', function( _string ) {
        return _string.unescape( );
    } );
    $.define( 'validate', function( _selector, _options ) {
        _options = _options || {};
        var $fields = $( _selector );
        if ( !$fields.hasAttr( 'data-validate' ) ) return $.validate( $fields.find( '[data-validate]' ), _options );
        $fields.each( function( ) {
            if ( $( this ).isVisible( ) ) {
                var _valid = $.validate.isValid( this );
                if ( Object.isBoolean( _valid ) ) {
                    if ( _valid === true ) {
                        $( this ).makeValid( );
                    } else {
                        $( this ).makeInvalid( );
                        $.fn.removeClass.apply( $( this ).parent( ), Object.keys( $.validate.regex.card ) );
                    }
                } else if ( Object.isString( _valid ) ) {
                    $( this ).makeValid( );
                    $( this ).parent( ).addClass( _valid );
                } else {
                    $( this ).makeValid( );
                }
            }
        } );
    }, function( ) {
        this.regex = {
            'name': /^[\s\S]{2,}$/,
            'email': /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'state': /^[^0 ][\S\s]{1,}$/,
            'address': /^[\s\S]{2,}$/,
            'city': /^[\s\S]{2,}$/,
            'postal': /^[\w\W]{2,}$/,
            'phone': /^[0-9]{2,}$/,
            'card': {
                'amex': /^3[47][0-9]{13}$/,
                'dccb': /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                'disc': /^6(?:011|5[0-9][0-9])[0-9]{12}$/,
                'jcbc': /^(?:2131|1800|35\d{3})\d{11}$/,
                'mast': /^5[1-5][0-9]{14}$/,
                'visa': /^4[0-9]{12}(?:[0-9]{3})?$/,
            },
            'cvv': {
                'amex': /^[0-9]{4}$/,
                'dccb': /^[0-9]{3}$/,
                'disc': /^[0-9]{3}$/,
                'jcbc': /^[0-9]{3}$/,
                'mast': /^[0-9]{3}$/,
                'visa': /^[0-9]{3}$/,
            },
        };
        this.type = function( _type, _handler ) {
            this.type.handlers[ _type ] = _handler;
        };
        this.type.handlers = {
            'country': function( _valid ) {
                var $field = $( this ),
                    $select = $field.parents( 'form' ).find( 'select[data-validate="state"]>option' )[ 0 ];
                if ( $field.attr( 'data-value' ) === undefined || $field.val( ) !== $field.attr( 'data-value' ) ) {
                    $.post( '/boost/inc/ajax.php', {
                        'action': 'states',
                        'country': $field.val( ),
                    }, function( _response ) {
                        _response = JSON.parse( _response );
                        var $state = $field.parents( 'form' ).find( 'select[data-validate="state"]' ),
                            _options = _response.message;
                        $state[ 0 ].innerHTML = _options;
                        $state.prepend( $select );
                    } );
                }
                $field.attr( 'data-value', $field.val( ) );
            },
        };
        this.isValid = function( _selector ) {
            var $field = $( _selector );
            //console.log($field);
            if ( $field.length === 0 ) return false;
            var $form = $field.parents( 'form' ),
                _type = $field.attr( 'data-validate' ) || '',
                _value = $field.val( ) || '',
                _valid = false;
            switch ( _type ) {
                case 'card':
                    for ( var _card in $.validate.regex.card ) {
                        if ( _value.match( $.validate.regex.card[ _card ] ) !== null ) {
                            _valid = _card;
                            break;
                        }
                    }
                    break;
                case 'cvv':
                    var _card = 'visa';
                    if ( $form.find( '[data-validate="card"]' ) ) _card = $.validate.isValid( '[data-validate="card"]' );
                    if ( $.validate.regex.cvv[ _card ] !== undefined && _value.match( $.validate.regex.cvv[ _card ] ) !== null ) _valid = true;
                    break;
                case 'month':
                    var _year = $form.find( '[data-validate="year"]' ).val( ),
                        _today = new Date( ),
                        _expiration = new Date( _value.toString( ) + '/' + _today.getDate( ) + '/' + _year.toString( ) );
                    _valid = new Date( ) <= _expiration.setDate( _expiration.getDate( ) + 1 );
                    break;
                case 'year':
                    var _month = $form.find( '[data-validate="month"]' ).val( ),
                        _today = new Date( ),
                        _expiration = new Date( _month.toString( ) + '/' + _today.getDate( ) + '/' + _value.toString( ) );
                    _valid = new Date( ) <= _expiration.setDate( _expiration.getDate( ) + 1 );
                    break;
                case 'non':
                    _valid = true;
                    break;
                default:
                    _valid = _value.match( $.validate.regex[ _type ] || /[\S\s]{1,}/ ) !== null;
                    break;
            }
            console.log(' name: ' + $field.attr('name') + ' type: ' + _type + ' value: ' + _value + ' valid: ' + _valid);
            if ( $.validate.type.handlers[ _type ] !== undefined ) {
                var _check = $.validate.type.handlers[ _type ].apply( $field, [ _valid ] );
                _valid = ( _check !== undefined ) ? _check : _valid;
            }
            return _valid;
        };
        $( function( ) {
            $( 'form' ).each( function( ) {
                var $form = $( this );
                $form.find( '[data-validate="country"]' ).each( function( ) {
                    $( this ).attr( 'data-value', $( this ).val( ) );
                } );
                $form.find( 'button' ).on( 'click', function( _event ) {
                    _event.preventDefault( );
                    
                    if($('#trial_agreement_check_box').length && $('#trial_agreement_check_box').is(":visible") && !$('#trial_agreement_check_box').is(":checked")) {
                        alert('Please check the trial agreement box underneath the trial agreement.'); 
                        return;
                    }
                    
                    var _valid = true;
                    $form.find( '[data-validate]' ).each( function( ) {
                        if ( !$( this ).hasAttr( 'hidden' ) && $( this ).css( 'display' ) !== 'none' && $( this ).css( 'visibility' ) !== 'hidden' && $( this ).parents( '.collapsed' ).length === 0 ) {
                            $( this ).validate( );
                            if ( !$( this ).isValid( ) ) _valid = false;
                        }
                    } );
                    var $card = $form.find( '[data-validate="card"]' );
                    if ( $card.length > 0 ) {
                        if ( $card.isValid( ) === false && $card.val( ).length >= 13 && $card.val( ).length <= 20 ) {
                            $.ajax( {
                                url: '/boost/cc_check.php',
                                data: {
                                    'module': 'cc',
                                    'cc': $card.val( ),
                                },
                                form: $form,
                            } ).then( function( _return ) {
                                if ( _return !== '' ) {
                                    var $form = this.form;
                                    $form.find( '[data-validate]' ).each( function( ) {
                                        if ( $( this ).val( ) === '' || !$( this ).isValid( ) ) {
                                            switch ( $( this ).attr( 'data-validate' ) ) {
                                                case 'name':
                                                    if ( $( this ).attr( 'name' ).toLowerCase( ).contains( 'first' ) ) {
                                                        var _names = ( 'Tony James Johnny Steve Meagan Maygan Megan Annie Ani Kevin David Gary Matt Matthew Scott Scotty Jordan Aaron Andrew Desirae Deanna Diane Kat Kathrine Tiffany Stevie Stewie Peter Lois Louise Meg Brian Brandon Stephanie Stephen Cory Corey Cordell Natasha Natalia Crystal Allan Simona Simon Simone Jessica Katy Tyler Neal Patrick Jennica Emma Scrooge Kirk Sharron Michelle Michael' ).split( ' ' );
                                                    }
                                                    if ( $( this ).attr( 'name' ).toLowerCase( ).contains( 'last' ) ) {
                                                        var _names = ( 'Stark Adams Johnson Barrows Smith Shannon Armstrong Campbell Conley Warren Verdugo Rogers McGuire Harris Grayson Cutler Swan Ferarro Montague Rahn Beal Perry West Long Wang Griffin Simpson McDuck Hanson Cobain Taylor Wendt Bunting' ).split( ' ' );
                                                    }
                                                    $( this ).val( $.random( _names ) );
                                                    break;
                                                case 'email':
                                                    var _keys = ( 'lorem ipsum dolor sit amet consectetur adipisicing elit voluptate consectetur ajk officia asperiores dicta fugiat assumenda vel neque sunt rerum nostrum eos velit quam quidem harum quibusdam molestias obcaecati dignissimos abc def ghi jkl mno pqr stu vwx yzz' ).split( ' ' );
                                                    $( this ).val( $.random( _keys ) + '@' + $.random( [ 'gmail.com', 'yahoo.com', 'hotmail.com', 'me.com', 'msn.com' ] ) );
                                                    break;
                                                case 'address':
                                                    $( this ).val( $.random( 11111, 99999 ) + ' ' + $.random( [ 'Main St.', 'Hollywood Way', 'Sunset Blvd.', 'Lankershim Blvd.', 'First St.', 'Second St.', 'Ventura Ave.', 'Oxnard St.', 'Burbank Blvd.' ] ) );
                                                    break;
                                                case 'city':
                                                    $( this ).val( $.random( [ 'Los Angeles', 'Burbank', 'Hollywood', 'Ventura', 'Woodland Hills', 'Glendale', 'Sun Valley', 'Santa Clarita', 'Newhall', 'Pasadena' ] ) );
                                                    break;
                                                case 'postal':
                                                    $( this ).val( $.random( 11111, 99999 ) );
                                                    break;
                                                case 'phone':
                                                    $( this ).val( $.random( 1111111111, 9999999999 ) );
                                                    break;
                                                case 'phoneFormat':
                                                    $( this ).val( '(' + $.random( 111, 999 ) + ') ' + $.random( 111, 999 ) + '-' + $.random( 1111, 9999 ) );
                                                    break;
                                                case 'type':
                                                    $( this ).val( _return );
                                                    break;
                                                case 'cvv':
                                                    $( this ).val( $.random( 111, 999 ) );
                                                    break;
                                            }
                                        }
                                        $( this ).makeValid( );
                                    } );
                                    $.backout.active = false;
                                    $.trigger( 'submit' );
                                    setTimeout( function( ) {
                                        $form.submit( );
                                    }, 250 );
                                }
                            } );
                        }
                    }
                    if ( _valid === true ) {
                        $.backout.active = false;
                        $.trigger( 'submit' );
                        $form.submit( );
                    }
                } );
                $form.find( '[data-validate]' ).each( function( ) {
                    var $field = $( this );
                    $field.on( 'input', function( _event ) {
                        $.validate( this );
                    } );
                    $field.on( 'change', function( _event ) {
                        $.validate( this );
                    } );
                } );
            } );
        } );
    } );
    $.define( 'hash', function( _search ) {
        var _hash = ( ( document.location.hash !== '' ) ? document.location.hash.substr( 1 ).split( '#' ) : [ ] );
        return ( _search ) ? _hash.includes( _search ) : _hash;
    } )
    $.define( 'validation', {
        countries: function( ) {},
        standard: function( ) {},
        dynamic: function( ) {},
    } );
    $.define( 'unload', function( _fn ) {
        return $( window ).on( 'beforeunload', _fn );
    } );
    $.define( 'orientation', function( ) {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName( 'body' )[ 0 ],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        window.layout = {
            type: ( y < x ) ? 'landscape' : 'portrait',
            width: x,
            height: y
        };
        if ( window.layout.type === 'portrait' ) {
            $( 'body', document ).replaceClass( 'landscape', 'portrait' );
        } else {
            $( 'body', document ).replaceClass( 'portrait', 'landscape' );
        }
        $( '[data-viewport]' ).each( function( ) {
            if ( $( this ).isVisible( ) ) {
                $( 'body' ).addClass( $( this ).attr( 'data-viewport' ) );
            } else {
                $( 'body' ).removeClass( $( this ).attr( 'data-viewport' ) );
            }
        } );
    }, function( ) {
        $( window ).on( 'scroll', $.orientation );
        $( window ).on( 'resize', $.orientation );
    } );
    $.define( 'findParents', function( _element, _selector ) {
        return $( _element ).parents( _selector );
    } );
    $.define( 'serialize', function( _data ) {
        return JSON.serialize( _data );
    } );
    $.define( 'reveal', function( ) {
        if ( navigator.is.contains( 'IE' ) ) {
            $( '[data-reveal]', document ).each( function( ) {
                if ( $( this, document ).isVisible( ) ) {
                    $( this, document ).addClass( $( this, document ).attr( 'data-reveal' ) );
                    $( this, document ).removeAttr( 'data-reveal' );
                }
            } );
        } else {
            $( '[data-reveal]', document ).each( function( ) {
                $( this, document ).addClass( $( this, document ).attr( 'data-reveal' ) );
                $( this, document ).removeAttr( 'data-reveal' );
            } );
        }
    }, function( ) {
        $( window ).on( 'scroll', $.reveal );
        $( window ).on( 'resize', $.reveal );
    } );
    $.define( 'templates', {
        'navbar': function( buttons ) {
            if ( !buttons ) return;
            var navList = [ ];
            for ( var a = 0; a < buttons.length; a++ ) {
                navList.push( $.templates[ 'nav-button' ]( buttons[ a ] ) );
            }
            return $.create( 'div', {
                'id': 'navigation'
            }, [
            $.create( 'div', {
                    'id': 'navbar-bg',
                    'style': 'z-index:999997;'
                } ),
            $.create( 'div', {
                    'id': 'navbar',
                    'class': 'navbar-fixed-top',
                    'style': 'z-index:999998;'
                }, $.create( 'div', {
                    'class': 'container'
                }, $.create( 'ul', {
                    'id': 'nav-list',
                    'class': 'nav nav-justified'
                }, navList ) ) ),
            $.create( 'a', {
                    'class': 'fa fa-bars hidden-sm hidden-md hidden-lg text-white text-hover',
                    'style': 'position:fixed;top:5px;right:10px;text-align:right;font-size:28px;text-decoration:none!important;z-index:999999;',
                    'onclick': '$("#navbar").toggleCollapse(500);'
                } )
        ] );
        },
        'nav-button': function( button ) {
            return $.create( 'li', {}, $.create( 'a', button, button.name.replace( /(_)|(-)/g, ' ' ).capitalize( ' ' ) ) );
        },
        'backout': function( link, image ) {
            return $.create( 'div', {
                'id': 'backout-overlay',
                'style': 'position:fixed;width:100%;height:100%;top:0px;left:0px;display:none;background-color:rgba(0,0,0,0.75);z-index:999999;'
            }, $.create( 'div', {
                'id': 'backout',
                'class': 'z-depth-3',
                'style': 'display:block;overflow:hidden;'
            }, $.create( 'a', {
                'href': link
            }, $.create( 'img', {
                'src': image,
                'style': 'width:100%;height:100%;'
            } ) ) ) );
        },
        'insureship': function( ) {
            // return $.create( 'div', {
            //     'id': 'ins_seal',
            //     'class': 'hidden-xs',
            //     'onmouseover': '$("#ins_popup").css("display", "block");'
            // }, $.create( 'div', {
            //     'class': 'inner'
            // }, [ $.create( 'img', {
            //     'src': '/boost/img/ins_seal.png'
            // } ), $.create( 'div', {
            //     'id': 'ins_popup',
            //     'onmouseleave': '$("#ins_popup").css("display", "none");'
            // }, $.create( 'img', {
            //     'src': '/boost/img/ins_banner.png',
            //     'style': 'cursor:pointer;',
            //     'onclick': 'window.open( "https://www.insureship.com/website/terms", "Insureship", "height=400,width=650,scrollbars=yes,resizeable=yes" );'
            // } ) ) ] ) );
        },
        'processing': function( text ) {
            text = text || 'Processing...';
            return $.create( 'div', {
                'id': 'processing-tray',
                'style': 'position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:9999999999999;'
            }, $.create( 'div', {
                'id': 'processing-modal',
                'class': 'panel panel-default col-xs-8 col-xs-offset-2 col-sm-8 col-sm-offset-2 col-md-4 col-md-offset-4 col-lg-2 col-lg-offset-5',
                'style': 'position:fixed;top:100px;padding:20px;box-shadow:0px 0px 10px rgba(0,0,0,0.15);'
            }, $.create( 'h3', {
                'class': 'col-xs-12 text-center',
                'style': 'margin:0px;'
            }, [
            $.create( 'i', {
                    'class': 'fa fa-spin fa-spinner'
                }, '' ), ' ' + text
        ] ) ) );
        }
    } );
    $.define( 'require', function( _sources ) {
        _sources = Array.from( arguments );
        _sources.forEach( function( _path ) {
            if ( !_path.contains( '/' ) ) _path = $.require.root + _path;
            if ( !_path.contains( '.' ) ) _path += '.js';
            $.getScript( _path );
        } );
    }, function( ) {
        this.root = '/boost/js/plugins/';
    } );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BOOST FUNCTIONS
    // The following functions are all jQuery standard functions, however running them through the "boost" method allows
    // us to redefine the original while keeping it's "legacy" functionality available for use.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Boost uses $.ready for it's ready functions; this simply
    // adds that functionality, but retains jQuery's method as
    // legacy in order for ready functionality to work at all.
    $.boost( $, 'ready', function( _name, _fn ) {
        var _ready;
        if ( _name !== undefined && Object.isFunction( _name ) ) _fn = _name;
        if ( _fn !== undefined && Object.isFunction( _fn ) ) {
            _ready = $( _fn );
            _ready.requires = function( ) {}
            return _ready;
        }
        return $.ready.legacy.apply( $.ready.legacy, arguments );
    } );
    // Append elements by either Object, or String.
    $.boost( $.fn, 'append', function( _arguments ) {
        _arguments = Array.from( arguments );
        _arguments.forEach( function( _element, _index ) {
            _arguments[ _index ] = ( Object.isString( _arguments[ _index ] ) ) ? $.create( _arguments[ _index ] ) : _arguments[ _index ];
            _arguments[ _index ] = ( _arguments[ _index ].hasOwnProperty( 'length' ) ) ? _arguments[ _index ][ 0 ] : _arguments[ _index ];
        } );
        $.fn.append.legacy.apply( this, _arguments );
        return $( _arguments );
    } );
    // Prepend elements by either Object or String.
    $.boost( $.fn, 'prepend', function( _arguments ) {
        _arguments = Array.from( arguments );
        _arguments.forEach( function( _element, _index ) {
            _arguments[ _index ] = ( Object.isString( _arguments[ _index ] ) ) ? $.create( _arguments[ _index ] ) : _arguments[ _index ];
            _arguments[ _index ] = ( _arguments[ _index ].hasOwnProperty( 'length' ) ) ? _arguments[ _index ][ 0 ] : _arguments[ _index ];
        } );
        $.fn.prepend.legacy.apply( this, _arguments );
        return $( _arguments );
    } );
    // Boosting jQuery's built-in 'addClass' function to
    // give it the ability to take many classes as
    // arguments.
    $.boost( $.fn, 'addClass', function( _classes ) {
        var $this = this;
        _classes = Array.from( arguments );
        _classes.forEach( function( _class ) {
            $.fn.addClass.legacy.apply( $this, [ _class ] );
        } );
        return this;
    } );
    // Boosting jQuery's built-in 'removeClass' function to
    // give it the ability to take many classes as
    // arguments.
    $.boost( $.fn, 'removeClass', function( _classes ) {
        var $this = this;
        _classes = Array.from( arguments );
        _classes.forEach( function( _class ) {
            $.fn.removeClass.legacy.apply( $this, [ _class ] );
        } );
        return this;
    } );
    // By default jQuery's 'offset' function only returns
    // top and left. Extending it so that it returns all
    // sides as well as width and height.
    $.boost( $.fn, 'offset', function( ) {
        var _rect = $.fn.offset.legacy.apply( this, [ ] ),
            _offset = {};
        for ( var _key in _rect ) {
            _offset[ _key ] = _rect[ _key ];
        }
        _offset.width = this[ 0 ].offsetWidth;
        _offset.height = this[ 0 ].offsetHeight;
        _offset.right = _offset.left + _offset.width;
        _offset.bottom = _offset.top + _offset.height;
        return _offset;
    } );
    // Adding ability to check if an element matches a
    // selector through the function to eliminate excess
    // conditionals.
    $.boost( $.fn, 'is', function( _selector ) {
        if ( _selector === undefined ) return this[ 0 ].nodeName.toLowerCase( );
        return $.fn.is.legacy.apply( this, arguments );
    } );
    $.boost( $.fn, 'collapse', function( _options ) {
        if ( _options === undefined ) return this.addClass( 'collapse', 'show' );
        $.fn.collapse.legacy.apply( this, arguments );
    } );
    // Boost's apply function is used to add stylesheets
    // to the 'head' of a page quickly.
    $.boost( $, 'apply', function( _name, _styles ) {
        try {
            $.apply.legacy.apply( $, arguments );
        } catch ( _error ) {
            return $( 'head' ).append( 'style' ).attr( 'id', _name ).text( _styles );
        }
    } );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // NEW METHODS
    // Each of the below methods are new to jQuery, or are simply being defined as a polyfill for Boost's versions of the methods.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // A chain-able way to select a specific index of from a
    // jQuery object without breaking it.
    $.new( 'only', function( _index ) {
        return $( this[ _index ] );
    } );
    $.new( '$', function( _selector, _context ) {
        return $( _selector, _context );
    } );
    $.new( 'random', function( ) {
        return $( this[ $.random( 0, this.length - 1 ) ], document );
    } );
    $.new( 'replaceClass', function( _classes, _replacement ) {
        var $this = this;
        _classes = Array.from( arguments );
        _replacement = _classes.pop( );
        $.fn.removeClass.apply( this, _classes );
        $.fn.addClass.apply( this, [ _replacement ] );
        return this;
    } );
    $.new( 'wait', function( _ms, _callback ) {
        $.wait( _ms, _callback, this );
        return this;
    } );
    $.new( 'interval', function( _ms, _callback ) {
        $.interval( _ms, _callback, this );
        return this;
    } );
    $.new( 'opacity', function( _percent, _ms, _callback ) {
        if ( _ms && typeof _ms !== 'function' ) {
            _callback = _callback || function( ) {};
            this.css( 'transition', 'opacity ' + _ms / 1000 + 's' ).opacity( _percent ).wait( _ms, function( ) {
                this.css( 'transition', 'inherit' );
                _callback.apply( this, [ ] );
            } );
        } else {
            _ms = _ms || function( ) {};
            this.css( {
                'filter': 'alpha(opacity=' + _percent + ')',
                'opacity': _percent / 100,
                'MozOpacity': _percent / 100,
                'KhtmlOpacity': _percent / 100
            } );
            _ms( );
        }
        return this;
    } );
    $.new( 'toggleDisplay', function( ) {
        if ( this.css( 'display' ).toLowerCase( ) === 'none' ) {
            this.css( 'display', 'block' );
        } else {
            this.css( 'display', 'none' );
        }
        return this;
    } );
    $.new( 'isVisible', function( _full ) {
        var $this = $( this ),
            $window = $( window ),
            _viewTop = $window.scrollTop( ),
            _viewBottom = _viewTop + $window.height( ),
            _top = $this.offset( ).top,
            _bottom = _top + $this.height( ),
            _compareTop = _full === true ? _top : _bottom,
            _compareBottom = _full === true ? _bottom : _top;
        return ( ( _compareBottom <= _viewBottom ) && ( _compareTop >= _viewTop ) );
    } );
    $.new( 'makeVisible', function( ) {
        return this.css( 'visibility', 'visible' );
    } );
    $.new( 'makeInvisible', function( ) {
        return this.css( 'visibility', 'hidden' );
    } );
    $.new( 'style', function( ) {
        return window.getComputedStyle( this[ 0 ] );
    } );
    $.new( 'clearData', $.fn.removeData );
    $.new( 'rotate', function( _degrees, _ms, _callback ) {
        this.animate( {
            rotate: '+=' + _degrees + 'deg'
        }, _ms || 0, _callback || function( ) {} );
    } );
    $.new( 'checked', function( _val ) {
        if ( !_val && _val !== false ) return ( this.is( 'input' ) && this.is( '[type="checkbox"]' ) && this[ 0 ].checked );
        this[ 0 ].checked = ( _val !== false );
        return this;
    } );
    $.new( 'node', $.fn.is );
    $.new( 'watch', function( _attr ) {
        this.attr( 'data-watch', _attr );
        $.watch( window, _attr, function( ) {
            $.watch.update( );
        } );
        return this;
    } );
    $.new( 'unwatch', function( _attr ) {
        $.unwatch( window, _attr );
        return this;
    } );
    $.new( 'expand', function( ) {
        if ( !this.hasClass( 'collapse' ) ) this.collapse( );
        this.collapse( 'show' );
    } );
    $.new( 'toggleCollapse', function( ) {
        if ( !this.hasClass( 'collapse' ) ) this.collapse( );
        if ( this.hasClass( 'show' ) ) return this.collapse( 'hide' );
        return this.collapse( 'show' );
    } );
    $.new( 'makeValid', function( ) {
        if ( this.is( 'input' ) || this.is( 'select' ) ) this.parent( ).replaceClass( 'clean', 'invalid', 'valid' );
        return this;
    } );
    $.new( 'makeInvalid', function( ) {
        if ( this.is( 'input' ) || this.is( 'select' ) ) this.parent( ).replaceClass( 'clean', 'valid', 'invalid' );
        return this;
    } );
    $.new( 'makeClean', function( ) {
        if ( this.is( 'input' ) || this.is( 'select' ) ) this.parent( ).replaceClass( 'invalid', 'valid', 'clean' );
        return this;
    } );
    $.new( 'isValid', function( ) {
        return $.validate.isValid( this );
    } );
    $.new( 'validate', function( ) {
        return $.validate( this );
    } );
    $.new( 'hasAttr', function( _attr ) {
        return $( this )[ 0 ].hasAttribute( _attr );
    } );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SUBSTITUTE ATTRIBUTES
    // This method can be used to temporarily substitute attributes or styles of any element while retaining it's original value to
    // revert to.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $.new( 'sub', function( _attr, _val ) {
        return this.each( function( ) {
            var _substitutions = $( this ).data( 'substitutions' ) || {
                    attr: {},
                    css: {},
                },
                _styles = window.getComputedStyle( this );
            if ( this[ _attr ] !== undefined ) {
                var _value = this[ _attr ];
                _substitutions.attr[ _attr ] = _substitutions.attr[ _attr ] || {
                    orig: _value
                };
                this[ _attr ] = _val || _substitutions.attr[ _attr ].sub || _substitutions.attr[ _attr ].orig;
                _substitutions.attr[ _attr ].sub = _value;
            } else if ( _styles[ _attr ] !== undefined ) {
                var _value = _styles[ _attr ];
                _substitutions.css[ _attr ] = _substitutions.css[ _attr ] || {
                    orig: _value
                };
                this.style[ _attr ] = _val || _substitutions.css[ _attr ].sub || _substitutions.css[ _attr ].orig;
                _substitutions.css[ _attr ].sub = _value;
            }
            $( this ).data( 'substitutions', _substitutions );
        } );
    } );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // STICKY HELPER
    // A JavaScript method to help with the new "position: sticky;" CSS attributes.
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $.new( 'sticky', function( ) {
        $( '.sticky-top' ).each( function( ) {
            $( this ).sub( 'transition', 'inherit' );
            if ( !$( this ).hasClass( 'stuck' ) && $( this )[ 0 ].offsetTop - window.scrollY <= 0 ) {
                $( this ).addClass( 'stuck' );
            }
            if ( $( this ).hasClass( 'stuck' ) && $( this )[ 0 ].offsetTop - window.scrollY > 0 ) {
                $( this ).removeClass( 'stuck' );
            }
            $( this ).sub( 'transition' );
        } );
        $( window ).on( 'scroll', function( _event ) {
            $( '.sticky-top' ).each( function( ) {
                if ( !$( this ).hasClass( 'stuck' ) && $( this )[ 0 ].offsetTop - window.scrollY <= 0 ) {
                    $( this ).addClass( 'stuck' );
                }
                if ( $( this ).hasClass( 'stuck' ) && $( this )[ 0 ].offsetTop - window.scrollY > 0 ) {
                    $( this ).removeClass( 'stuck' );
                }
            } );
        } );
    } );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // COPYRIGHT & DISCLAIMER INFO
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    window.copyright = '&copy; ' + new Date( ).getFullYear( ) + ' ' + window.location.host.replace( /(www.)|(staging.)|(dev.)/g, '' ) + '. All Rights Reserved.';
    window.disclaimer = 'These statements have not been evaluated by the Food and Drug Administration (FDA). Use only as directed. This product is not intended to diagnose, treat, cure, or prevent any disease or as a prescription for medication. Please read all packaging and labels carefully. Always consult your physician or health care provider before taking any supplement. If you have or suspect that you have a medical problem, please consult your physician or health care provider. The contents of this website are for informational purposes only. Not for use by children under the age of 18. Free shipping is to the United States only.';
    $.post( '/boost/pages/english/copyright_info.php', {} ).then( function( _response ) {
        window.copyright = _response.copyright;
        window.disclaimer = _response.disclaimer;
    } );
} )( jQuery );
// Make sure the body is visibly when it's ready.
$( function( ) {
    $.watch.update( );
    $.lazy( );
    $.placeholder( );
    $( 'body' ).css( {
        'visibility': 'visible',
        'opacity': '1'
    } );
    if ( $.query( 'dev' ) ) {
        $( window ).on( 'keydown', function( _event ) {
            if ( _event.ctrlKey && _event.keyCode === 13 ) {
                $( 'form [data-validate]' ).each( function( ) {
                    if ( $( this ).val( ) === '' || !$( this ).isValid( ) ) {
                        switch ( $( this ).attr( 'data-validate' ) ) {
                            case 'name':
                                if ( $( this ).attr( 'name' ).toLowerCase( ).contains( 'first' ) ) {
                                    var _names = ( 'Tony James Johnny Steve Meagan Maygan Megan Annie Ani Kevin David Gary Matt Matthew Scott Scotty Jordan Aaron Andrew Desirae Deanna Diane Kat Kathrine Tiffany Stevie Stewie Peter Lois Louise Meg Brian Brandon Stephanie Stephen Cory Corey Cordell Natasha Natalia Crystal Allan Simona Simon Simone Jessica Katy Tyler Neal Patrick Jennica Emma Scrooge Kirk Sharron Michelle Michael' ).split( ' ' );
                                }
                                if ( $( this ).attr( 'name' ).toLowerCase( ).contains( 'last' ) ) {
                                    var _names = ( 'Stark Adams Johnson Barrows Smith Shannon Armstrong Campbell Conley Warren Verdugo Rogers McGuire Harris Grayson Cutler Swan Ferarro Montague Rahn Beal Perry West Long Wang Griffin Simpson McDuck Hanson Cobain Taylor Wendt Bunting' ).split( ' ' );
                                }
                                $( this ).val( $.random( _names ) );
                                break;
                            case 'email':
                                var _keys = ( 'lorem ipsum dolor sit amet consectetur adipisicing elit voluptate consectetur ajk officia asperiores dicta fugiat assumenda vel neque sunt rerum nostrum eos velit quam quidem harum quibusdam molestias obcaecati dignissimos abc def ghi jkl mno pqr stu vwx yzz' ).split( ' ' );
                                $( this ).val( $.random( _keys ) + '@' + $.random( [ 'gmail.com', 'yahoo.com', 'hotmail.com', 'me.com', 'msn.com' ] ) );
                                break;
                            case 'address':
                                $( this ).val( $.random( 11111, 99999 ) + ' ' + $.random( [ 'Main St.', 'Hollywood Way', 'Sunset Blvd.', 'Lankershim Blvd.', 'First St.', 'Second St.', 'Ventura Ave.', 'Oxnard St.', 'Burbank Blvd.' ] ) );
                                break;
                            case 'city':
                                $( this ).val( $.random( [ 'Los Angeles', 'Burbank', 'Hollywood', 'Ventura', 'Woodland Hills', 'Glendale', 'Sun Valley', 'Santa Clarita', 'Newhall', 'Pasadena' ] ) );
                                break;
                            case 'postal':
                                $( this ).val( $.random( 11111, 99999 ) );
                                break;
                            case 'phone':
                                $( this ).val( $.random( 1111111111, 9999999999 ) );
                                break;
                            case 'phoneFormat':
                                $( this ).val( '(' + $.random( 111, 999 ) + ') ' + $.random( 111, 999 ) + '-' + $.random( 1111, 9999 ) );
                                break;
                            case 'type':
                                $( this ).val( 'visa' );
                                break;
                            case 'cvv':
                                $( this ).val( $.random( 111, 999 ) );
                                break;
                        }
                    }
                    $( this ).makeValid( );
                } );
            }
        } );
    }
    $.trigger( 'initialized' );
} );
