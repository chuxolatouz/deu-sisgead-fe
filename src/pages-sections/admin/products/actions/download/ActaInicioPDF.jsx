import React from 'react';
import {
    Document, Text, Page, View, StyleSheet, Font,
} from '@react-pdf/renderer';

const PLACEHOLDER = '(POR DEFINIR)';

// Firmantes predefinidos (mismos del backend)
const FIRMANTES_PREDEFINIDOS = [
    {
        entidad: 'Direccion de Extension Universitaria',
        nombre: 'Mercy Ospina',
        cargo: 'Directora de Extension Universitaria',
        correo: 'deu.direccion@gmail.com',
        telefono: PLACEHOLDER,
    },
    {
        entidad: 'Cuerpo de Bomberos Universitario',
        nombre: 'Maria Rosario Alanis',
        cargo: 'Comandante de Bomberos',
        correo: PLACEHOLDER,
        telefono: PLACEHOLDER,
    },
    {
        entidad: 'Direccion de Mantenimiento',
        nombre: 'Luis Vasquez',
        cargo: 'Director de Mantenimiento',
        correo: PLACEHOLDER,
        telefono: PLACEHOLDER,
    },
    {
        entidad: 'ZD Mecademy',
        nombre: PLACEHOLDER,
        cargo: PLACEHOLDER,
        correo: PLACEHOLDER,
        telefono: PLACEHOLDER,
    },
    {
        entidad: 'CANATAME',
        nombre: PLACEHOLDER,
        cargo: PLACEHOLDER,
        correo: PLACEHOLDER,
        telefono: PLACEHOLDER,
    },
];

// Helper para formatear valores de texto
const _text = (value, defaultValue = PLACEHOLDER) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string' && !value.trim()) return defaultValue;
    return value;
};

// Helper para formatear montos en Bs.
const formatBs = (amount) => {
    try {
        const numeric = parseFloat(amount);
        if (isNaN(numeric)) return 'N/A';
        return `Bs. ${numeric.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    } catch {
        return 'N/A';
    }
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
        marginBottom: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 4,
    },
    subsectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 6,
    },
    text: {
        fontSize: 10,
        marginBottom: 4,
        textAlign: 'justify',
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
    },
    tableCellHeader: {
        fontWeight: 'bold',
    },
    list: {
        marginLeft: 18,
        marginTop: 6,
        marginBottom: 8,
    },
    listItem: {
        fontSize: 10,
        marginBottom: 2,
    },
    firmaSection: {
        marginTop: 22,
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 4,
    },
    firmaText: {
        fontSize: 11,
    },
});

function ActaInicioPDF({ project, departamento, recursos = [], firmantes = FIRMANTES_PREDEFINIDOS }) {
    const fechaEmision = new Date().toLocaleDateString('es-VE');
    const objetivosEspecificos = Array.isArray(project?.objetivos_especificos)
        ? project.objetivos_especificos
        : typeof project?.objetivos_especificos === 'string'
            ? [project.objetivos_especificos]
            : [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>ACTA DE CONSTITUCION DEL PROYECTO</Text>

                <Text style={styles.sectionTitle}>INFORMACION GENERAL DEL PROYECTO</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '35%' }]}>
                            <Text>Nombre del proyecto</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '65%' }]}>
                            <Text>{_text(project?.nombre)}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '35%' }]}>
                            <Text>Codigo</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '65%' }]}>
                            <Text>{_text(project?.codigo, 'N/A')}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '35%' }]}>
                            <Text>Departamento</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '65%' }]}>
                            <Text>{_text(departamento, 'N/A')}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.tableCellHeader, { width: '35%' }]}>
                            <Text>Fecha de emision</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '65%' }]}>
                            <Text>{fechaEmision}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>DESCRIPCION DEL PROYECTO</Text>
                <Text style={styles.text}>{_text(project?.descripcion)}</Text>

                <Text style={styles.sectionTitle}>OBJETIVOS</Text>
                <Text style={styles.subsectionTitle}>Objetivo general</Text>
                <Text style={styles.text}>{_text(project?.objetivo_general)}</Text>

                <Text style={styles.subsectionTitle}>Objetivos especificos</Text>
                {objetivosEspecificos.length > 0 ? (
                    <View style={styles.list}>
                        {objetivosEspecificos.map((objetivo, index) => (
                            <Text key={index} style={styles.listItem}>• {objetivo}</Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.text}>{PLACEHOLDER}</Text>
                )}

                <Text style={styles.sectionTitle}>JUSTIFICACION</Text>
                <Text style={styles.text}>{_text(project?.justificacion)}</Text>

                <Text style={styles.sectionTitle}>RECURSOS ASIGNADOS</Text>
                {recursos.length > 0 ? (
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <View style={[styles.tableCell, styles.tableCellHeader, { width: '25%' }]}>
                                <Text>Cuenta</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellHeader, { width: '45%' }]}>
                                <Text>Descripcion</Text>
                            </View>
                            <View style={[styles.tableCell, styles.tableCellHeader, { width: '30%' }]}>
                                <Text>Monto (Bs)</Text>
                            </View>
                        </View>
                        {recursos.map((recurso, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={[styles.tableCell, { width: '25%' }]}>
                                    <Text>{_text(recurso.cuenta, 'N/A')}</Text>
                                </View>
                                <View style={[styles.tableCell, { width: '45%' }]}>
                                    <Text>{_text(recurso.descripcion, 'N/A')}</Text>
                                </View>
                                <View style={[styles.tableCell, { width: '30%' }]}>
                                    <Text>{formatBs(recurso.monto)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.text}>{PLACEHOLDER}</Text>
                )}

                <Text style={styles.sectionTitle}>ALCANCE</Text>
                <Text style={styles.subsectionTitle}>Alcance del Producto</Text>
                <Text style={styles.text}>{_text(project?.alcance_producto)}</Text>

                <Text style={styles.subsectionTitle}>Alcance del Proyecto</Text>
                <Text style={styles.text}>{_text(project?.alcance_proyecto)}</Text>

                <Text style={styles.sectionTitle}>ACEPTACION Y FIRMAS</Text>
                {firmantes.map((firmante, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>{_text(firmante.entidad, 'N/A')}</Text>
                        <View style={styles.firmaSection}>
                            <Text style={styles.firmaText}>
                                {_text(firmante.nombre, 'N/A')} - {_text(firmante.cargo, 'N/A')} | Correo: {_text(firmante.correo, 'N/A')} | Telefono: {_text(firmante.telefono, 'N/A')}
                            </Text>
                        </View>
                    </View>
                ))}
            </Page>
        </Document>
    );
}

export default ActaInicioPDF;
