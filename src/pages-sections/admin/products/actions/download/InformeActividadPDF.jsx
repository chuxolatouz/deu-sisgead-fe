import React from 'react';
import {
    Document, Text, Page, View, StyleSheet, Font,
} from '@react-pdf/renderer';

const PLACEHOLDER = '(POR DEFINIR)';

// Helper para formatear valores de texto
const _text = (value, defaultValue = PLACEHOLDER) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string' && !value.trim()) return defaultValue;
    return value;
};

// Registrar fuente
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'Helvetica' },
        { src: 'Helvetica-Bold', fontWeight: 'bold' },
    ],
});

// Estilos del PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 24,
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.35,
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 14,
        fontWeight: 'bold',
    },
    table: {
        display: 'table',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#777',
        marginTop: 8,
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        backgroundColor: '#f2f2f2',
    },
    tableCell: {
        padding: 6,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#777',
        fontSize: 10,
        verticalAlign: 'top',
    },
    tableCellHeader: {
        fontWeight: 'bold',
        textAlign: 'left',
    },
    text: {
        fontSize: 10,
        marginTop: 6,
        marginBottom: 6,
        textAlign: 'justify',
    },
    label: {
        fontWeight: 'bold',
    },
});

function InformeActividadPDF({ project, data = {} }) {
    const fechaActual = new Date().toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    // Defaults basados en el proyecto
    const defaults = {
        fecha: fechaActual,
        nombre_actividad: project?.nombre || PLACEHOLDER,
        ubicacion: PLACEHOLDER,
        objetivo: project?.objetivo_general || PLACEHOLDER,
        linea_estrategica: PLACEHOLDER,
        descripcion: project?.descripcion || PLACEHOLDER,
        recursos_humanos: PLACEHOLDER,
        recursos: PLACEHOLDER,
        resultados: PLACEHOLDER,
        logros: PLACEHOLDER,
        limitaciones: PLACEHOLDER,
        lecciones: PLACEHOLDER,
        lineas_accion: PLACEHOLDER,
        registro_fotografico: PLACEHOLDER,
        factura: PLACEHOLDER,
        presupuesto: PLACEHOLDER,
        retenciones_impuesto: PLACEHOLDER,
        proyecto_nombre: project?.nombre || PLACEHOLDER,
    };

    // Combinar defaults con data proporcionada
    const context = Object.keys(defaults).reduce((acc, key) => {
        acc[key] = _text(data[key], defaults[key]);
        return acc;
    }, {});

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>INFORME DE ACTIVIDAD</Text>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>FECHA</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.fecha}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>NOMBRE DE LA ACTIVIDAD</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.nombre_actividad}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>UBICACION</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.ubicacion}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>OBJETIVO</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.objetivo}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>LINEA ESTRATEGICA</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.linea_estrategica}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>DESCRIPCION</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.descripcion}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>RECURSOS HUMANOS UTILIZADOS</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.recursos_humanos}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>RECURSOS UTILIZADOS</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.recursos}</Text>
                        </View>
                    </View>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                            <Text>RESULTADOS OBTENIDOS</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%' }]}>
                            <Text>{context.resultados}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>
                            <Text>LOGROS</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>
                            <Text>LIMITACIONES</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>
                            <Text>LECCIONES</Text>
                        </View>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>
                            <Text>LINEAS DE ACCION</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: '25%' }]}>
                            <Text>{context.logros}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '25%' }]}>
                            <Text>{context.limitaciones}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '25%' }]}>
                            <Text>{context.lecciones}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '25%' }]}>
                            <Text>{context.lineas_accion}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.text}>
                    <Text style={styles.label}>Registro fotografico: </Text>
                    {context.registro_fotografico}
                </Text>
                <Text style={styles.text}>
                    <Text style={styles.label}>Factura: </Text>
                    {context.factura}
                </Text>
                <Text style={styles.text}>
                    <Text style={styles.label}>Presupuesto: </Text>
                    {context.presupuesto}
                </Text>
                <Text style={styles.text}>
                    <Text style={styles.label}>Retenciones de impuesto: </Text>
                    {context.retenciones_impuesto}
                </Text>
                <Text style={styles.text}>
                    <Text style={styles.label}>Proyecto relacionado: </Text>
                    {context.proyecto_nombre}
                </Text>
            </Page>
        </Document>
    );
}

export default InformeActividadPDF;
