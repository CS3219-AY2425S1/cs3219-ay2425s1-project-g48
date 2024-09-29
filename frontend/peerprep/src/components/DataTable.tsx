import React, { useMemo } from 'react';
import {
    useReactTable,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';

type DataTableProps<T> = {
    columns: ColumnDef<T>[];
    data: T[];
    columnFilters: any[];
    setColumnFilters: (filters: any[]) => void;
};

const DataTable = <T,>({ columns, data, columnFilters, setColumnFilters }: DataTableProps<T>) => {
    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <Box className="bg-white justify-between bg-opacity-10 rounded-md border-radius-md p-4" overflowX="auto">
            <Table variant='simple' colorScheme='#141A67'>
                <Thead 
                    border="2px solid" 
                    borderColor="white">
                    {table.getHeaderGroups().map(headerGroup => (
                        <Tr key={headerGroup.id} bgColor="purple.200" boxShadow="md">
                            {headerGroup.headers.map(header => (
                                <Th key={header.id} px={6} py={4} textAlign="center" textColor="black.300" fontSize={'large'}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map(row => (
                        <Tr 
                            key={row.id} 
                            color={'white'} 
                            _hover={{ bgColor: 'purple' }}
                            border="2px solid" 
                            borderColor="white"
                        >
                            {row.getVisibleCells().map(cell => (
                                <Td 
                                    key={cell.id} 
                                    px={6} 
                                    py={4}
                                    fontSize={'large'}
                                    textAlign="center" 
                                    borderRight="2px solid" 
                                    borderColor="gray.300"
                                    _last={{ borderRight: "none" }}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default DataTable;
