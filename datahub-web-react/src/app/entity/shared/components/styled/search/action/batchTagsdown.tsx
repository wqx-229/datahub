import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import DOMPurify from 'dompurify';
import { useGetSchemaBlameQuery } from '../../../../../../../graphql/schemaBlame.generated';
import UpdateDescriptionModal from '../../../legacy/DescriptionModal';
import { SubResourceType, SchemaFieldBlame } from '../../../../../../../types.generated';
import { useUpdateDescriptionMutation } from '../../../../../../../graphql/mutations.generated';
import ActionDropdown from './ActionDropdown';

type Props = {
    urns: Array<string>;
    disabled: boolean;
    refetch?: () => void;
};

// eslint-disable-next-line
export default function OwnersDropdown({ urns, disabled = false, refetch }: Props) {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [description, setDescription] = useState<any>('');
    const [dataUrn, setDataUrn] = useState('');
    const [updateDescription] = useUpdateDescriptionMutation();
    const [original] = useState('');
    const [schemaFieldBlameList, setSchemaFieldBlameList] = useState<Array<SchemaFieldBlame>>([]);

    const { data: getSchemaBlameData } = useGetSchemaBlameQuery({
        variables: {
            input: {
                datasetUrn: dataUrn,
            },
        },
        fetchPolicy: 'cache-first',
    });
    const onUpdate = (updatedDescription: any, urn: string, fieldPath: any) => {
        updateDescription({
            variables: {
                input: {
                    description: DOMPurify.sanitize(updatedDescription),
                    resourceUrn: urn,
                    subResource: fieldPath,
                    subResourceType: SubResourceType.DatasetField,
                },
            },
        });
    };
    useEffect(() => {
        console.log('111111', getSchemaBlameData);

        if (getSchemaBlameData) {
            const schemaFieldBlameLists: Array<SchemaFieldBlame> =
                (getSchemaBlameData?.getSchemaBlame?.schemaFieldBlameList as Array<SchemaFieldBlame>) || [];
            setSchemaFieldBlameList(schemaFieldBlameLists);
        }
    }, [getSchemaBlameData]);

    console.log(getSchemaBlameData);
    if (getSchemaBlameData) {
        schemaFieldBlameList.forEach((i) => {
            console.log(description, dataUrn, i.fieldPath, '111');
            onUpdate(description, dataUrn, i.fieldPath);
        });
    }

    const onSubmit = (descriptions: any) => {
        message.loading({ content: 'Updating...' });
        setDescription(descriptions);
        console.log('urns', urns);

        urns.forEach((item) => {
            const { data: getSchemaBlameData } = useGetSchemaBlameQuery({
                variables: {
                    input: {
                        datasetUrn: item,
                    },
                },
                fetchPolicy: 'cache-first',
            });
        });

        if (getSchemaBlameData) {
            const schemaFieldBlameLists: Array<SchemaFieldBlame> =
                (getSchemaBlameData?.getSchemaBlame?.schemaFieldBlameList as Array<SchemaFieldBlame>) || [];
            setSchemaFieldBlameList(schemaFieldBlameLists);
        }

        setIsEditModalVisible(false);
    };

    return (
        <>
            <ActionDropdown
                name="字段"
                actions={[
                    {
                        title: '批量编辑',
                        onClick: () => {
                            // setOperationType(OperationType.ADD);
                            setIsEditModalVisible(true);
                        },
                    },
                ]}
                disabled={disabled}
            />
            {isEditModalVisible && (
                <div>
                    <UpdateDescriptionModal
                        title="Update description"
                        description={description}
                        original={original || ''}
                        onClose={() => setIsEditModalVisible(false)}
                        onSubmit={onSubmit}
                        isAddDesc={!description}
                    />
                </div>
            )}
        </>
    );
}
